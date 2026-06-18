import { Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { MailService } from "../mail/mail.service.js";
import { CreateInterviewDTO } from "./dto/create-interview.dto.js";
import { QueryInterviewDTO } from "./dto/query-interview.dto.js";
import { UpdateInterviewDTO } from "./dto/update-interview.dto.js";
import { sendInterviewScheduleEmails } from "./interview.notifier.js";

export class InterviewService {
  constructor(
    private prisma: PrismaClient,
    private mailService: MailService,
  ) {}

  private getInterviewOrThrow = async (id: string, companyId: string) => {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: { include: { job: { select: { companyId: true } } } },
      },
    });
    if (!interview || interview.deletedAt) {
      throw new ApiError("Interview not found", 404);
    }
    if (interview.application.job.companyId !== companyId) {
      throw new ApiError("You don't have access to this interview", 403);
    }
    return interview;
  };

  private validateScheduledAt = (iso: string) => {
    const date = new Date(iso);
    if (date <= new Date()) {
      throw new ApiError("Interview must be scheduled in the future", 400);
    }
    return date;
  };

  createInterview = async (
    companyId: string | undefined,
    body: CreateInterviewDTO,
  ) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }

    const application = await this.prisma.application.findUnique({
      where: { id: body.applicationId },
      include: { job: { select: { companyId: true } } },
    });

    if (!application) {
      throw new ApiError("Application not found", 404);
    }
    if (application.job.companyId !== companyId) {
      throw new ApiError("You don't have access to this application", 403);
    }
    if (application.status !== "accepted") {
      throw new ApiError(
        "Interview can only be scheduled for accepted applicants",
        400,
      );
    }
    const activeInterview = await this.prisma.interview.findFirst({
      where: { applicationId: body.applicationId, deletedAt: null },
    });
    if (activeInterview) {
      throw new ApiError("This application already has an interview", 400);
    }
    await this.prisma.interview.deleteMany({
      where: { applicationId: body.applicationId, deletedAt: { not: null } },
    });

    const scheduledAt = this.validateScheduledAt(body.scheduledAt);

    const created = await this.prisma.interview.create({
      data: {
        applicationId: body.applicationId,
        scheduledAt,
        location: body.location,
        notes: body.notes,
      },
      include: {
        application: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true } },
              },
            },
            job: { select: { id: true, title: true } },
          },
        },
      },
    });
    sendInterviewScheduleEmails(
      this.prisma,
      this.mailService,
      created.id,
    ).catch(() => {});
    return created;
  };

  getInterviews = async (
    companyId: string | undefined,
    query: QueryInterviewDTO,
  ) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const sortBy = query.sortBy ?? "scheduledAt";
    const sortOrder = query.sortOrder ?? "asc";

    const where: Prisma.InterviewWhereInput = {
      application: { job: { companyId } },
      deletedAt: null,
    };

    const [data, total] = await Promise.all([
      this.prisma.interview.findMany({
        where,
        include: {
          application: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  profile: {
                    select: { fullName: true, photoUrl: true },
                  },
                },
              },
              job: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.interview.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  };

  getInterviewById = async (id: string, companyId: string | undefined) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }
    await this.getInterviewOrThrow(id, companyId);
    return this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            user: { select: { id: true, email: true, profile: true } },
            job: { select: { id: true, title: true, city: true } },
          },
        },
      },
    });
  };

  updateInterview = async (
    id: string,
    companyId: string | undefined,
    body: UpdateInterviewDTO,
  ) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }
    await this.getInterviewOrThrow(id, companyId);

    const scheduledAt = body.scheduledAt
      ? this.validateScheduledAt(body.scheduledAt)
      : undefined;

    return this.prisma.interview.update({
      where: { id },
      data: {
        ...(scheduledAt && { scheduledAt }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
    });
  };

  deleteInterview = async (id: string, companyId: string | undefined) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }
    await this.getInterviewOrThrow(id, companyId);
    await this.prisma.interview.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { ok: true };
  };

  getInterviewsByUser = async (userId: string) => {
    const interviews = await this.prisma.interview.findMany({
      where: { application: { userId }, deletedAt: null },
      include: {
        application: {
          select: {
            id: true,
            status: true,
            job: {
              select: {
                id: true,
                title: true,
                city: true,
                company: {
                  select: { id: true, name: true, logoUrl: true },
                },
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
    });
    return { data: interviews };
  };
}
