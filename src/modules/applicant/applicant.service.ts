import { Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { QueryApplicantDTO } from "./dto/query-applicant.dto.js";
import { UpdateApplicantStatusDTO } from "./dto/update-applicant-status.dto.js";

export class ApplicantService {
  constructor(private prisma: PrismaClient) {}

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

  private buildProfileFilters = (query: QueryApplicantDTO) => {
    const profileFilters: Prisma.UserProfileWhereInput = {};
    let hasFilter = false;

    if (query.search) {
      profileFilters.fullName = {
        contains: query.search,
        mode: "insensitive",
      };
      hasFilter = true;
    }

    if (query.education) {
      profileFilters.education = {
        contains: query.education,
        mode: "insensitive",
      };
      hasFilter = true;
    }

    if (query.minAge !== undefined || query.maxAge !== undefined) {
      const birthDateFilter: { gte?: Date; lte?: Date } = {};
      const today = new Date();

      if (query.minAge !== undefined) {
        const maxBirth = new Date(today);
        maxBirth.setFullYear(today.getFullYear() - query.minAge);
        birthDateFilter.lte = maxBirth;
      }

      if (query.maxAge !== undefined) {
        const minBirth = new Date(today);
        minBirth.setFullYear(today.getFullYear() - query.maxAge - 1);
        birthDateFilter.gte = minBirth;
      }

      profileFilters.birthDate = birthDateFilter;
      hasFilter = true;
    }

    return hasFilter ? profileFilters : null;
  };

  getApplicants = async (
    companyId: string | undefined,
    query: QueryApplicantDTO,
  ) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const sortBy = query.sortBy ?? "appliedAt";
    const sortOrder = query.sortOrder ?? "asc";

    const where: Prisma.ApplicationWhereInput = {
      job: { companyId },
    };

    if (query.jobId) {
      where.jobId = query.jobId;
    }
    if (query.status) {
      where.status = query.status;
    }

    const profileFilters = this.buildProfileFilters(query);
    if (profileFilters) {
      where.user = { profile: profileFilters };
    }

    if (query.minSalary !== undefined || query.maxSalary !== undefined) {
      const salaryFilter: { gte?: number; lte?: number } = {};
      if (query.minSalary !== undefined) {
        salaryFilter.gte = query.minSalary;
      }
      if (query.maxSalary !== undefined) {
        salaryFilter.lte = query.maxSalary;
      }
      where.expectedSalary = salaryFilter;
    }

    const [data, total] = await Promise.all([
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

  getApplicantById = async (
    applicationId: string,
    companyId: string | undefined,
  ) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }
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
    companyId: string | undefined,
    body: UpdateApplicantStatusDTO,
  ) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }
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
