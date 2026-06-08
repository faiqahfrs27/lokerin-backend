import { Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateInterviewDTO } from "./dto/create-interview.dto.js";
import { QueryInterviewDTO } from "./dto/query-interview.dto.js";
import { UpdateInterviewDTO } from "./dto/update-interview.dto.js";

export class InterviewService {
  constructor(private prisma: PrismaClient) {}

  private getInterviewOrThrow = async (id: string, companyId: string) => {
    const interview = await this.prisma.interview.findUnique({
      where: { id },
      include: {
        application: { include: { job: { select: { companyId: true } } } },
      },
    });
    if (!interview) {
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
      include: {
        job: { select: { companyId: true } },
        interview: true,
      },
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
    if (application.interview) {
      throw new ApiError("This application already has an interview", 400);
    }

    const scheduledAt = this.validateScheduledAt(body.scheduledAt);

    return this.prisma.interview.create({
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
    await this.prisma.interview.delete({ where: { id } });
    return { ok: true };
  };
}
