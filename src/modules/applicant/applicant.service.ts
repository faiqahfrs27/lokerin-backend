import { Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { QueryApplicantDTO } from "./dto/query-applicant.dto.js";
import { UpdateApplicantStatusDTO } from "./dto/update-applicant-status.dto.js";

export class ApplicantService {
  constructor(private prisma: PrismaClient) {}

  private resolveCompanyId = async (userId: string): Promise<string> => {
    if (!userId) {
      throw new ApiError("Unauthorized", 401);
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true },
    });
    if (!user?.companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }
    return user.companyId;
  };

  private getApplicationOrThrow = async (
    applicationId: string,
    companyId: string,
  ) => {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { companyId: true } } },
    });
    if (!application) {
      throw new ApiError("Application not found", 404);
    }
    if (application.job.companyId !== companyId) {
      throw new ApiError("You don't have access to this applicant", 403);
    }
    return application;
  };

  getApplicants = async (userId: string, query: QueryApplicantDTO) => {
    const companyId = await this.resolveCompanyId(userId);

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const sortBy = query.sortBy ?? "appliedAt";
    const sortOrder = query.sortOrder ?? "desc";

    const where: Prisma.ApplicationWhereInput = {
      job: { companyId },
    };
    if (query.jobId) {
      where.jobId = query.jobId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.user = {
        profile: { fullName: { contains: query.search, mode: "insensitive" } },
      };
    }
    if (query.education) {
      where.user = {
        ...(where.user as object),
        profile: {
          education: { contains: query.education, mode: "insensitive" },
        },
      };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  fullName: true,
                  education: true,
                  photoUrl: true,
                  birthDate: true,
                },
              },
            },
          },
          job: { select: { id: true, title: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  };

  getApplicantById = async (applicationId: string, userId: string) => {
    const companyId = await this.resolveCompanyId(userId);
    await this.getApplicationOrThrow(applicationId, companyId);
    return this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: { select: { id: true, email: true, profile: true } },
        job: { select: { id: true, title: true, city: true } },
      },
    });
  };

  updateStatus = async (
    applicationId: string,
    userId: string,
    body: UpdateApplicantStatusDTO,
  ) => {
    const companyId = await this.resolveCompanyId(userId);
    await this.getApplicationOrThrow(applicationId, companyId);

    if (body.status === "rejected" && !body.rejectionReason) {
      throw new ApiError("Rejection reason is required when rejecting", 400);
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: body.status,
        rejectionReason:
          body.status === "rejected" ? body.rejectionReason : null,
      },
    });
  };
}
