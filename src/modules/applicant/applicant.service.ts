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

  private findBestAttempt = async (userId: string, jobId: string) => {
    const attempts = await this.prisma.testAttempt.findMany({
      where: { userId, test: { jobId } },
      include: { test: { select: { passingScore: true } } },
      orderBy: { score: "desc" },
      take: 1,
    });
    return attempts[0] ?? null;
  };

  private findBestAttemptsBatch = async (
    pairs: { userId: string; jobId: string }[],
  ) => {
    if (pairs.length === 0) {
      return new Map<
        string,
        Awaited<ReturnType<typeof this.findBestAttempt>>
      >();
    }
    const userIds = [...new Set(pairs.map((p) => p.userId))];
    const jobIds = [...new Set(pairs.map((p) => p.jobId))];

    const attempts = await this.prisma.testAttempt.findMany({
      where: {
        userId: { in: userIds },
        test: { jobId: { in: jobIds } },
      },
      include: { test: { select: { jobId: true, passingScore: true } } },
      orderBy: { score: "desc" },
    });

    type Attempt = (typeof attempts)[number];
    const map = new Map<string, Attempt>();
    for (const a of attempts) {
      const key = `${a.userId}-${a.test.jobId}`;
      if (!map.has(key)) map.set(key, a);
    }
    return map;
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

    const where: Prisma.ApplicationWhereInput = { job: { companyId } };

    if (query.jobId) where.jobId = query.jobId;
    if (query.status) where.status = query.status;

    const profileFilters = this.buildProfileFilters(query);
    if (profileFilters) where.user = { profile: profileFilters };

    if (query.minSalary !== undefined || query.maxSalary !== undefined) {
      const salaryFilter: { gte?: number; lte?: number } = {};
      if (query.minSalary !== undefined) salaryFilter.gte = query.minSalary;
      if (query.maxSalary !== undefined) salaryFilter.lte = query.maxSalary;
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
          job: { select: { id: true, title: true, hasTest: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);

    const pairs = data.map((a) => ({ userId: a.userId, jobId: a.jobId }));
    const attemptsMap = await this.findBestAttemptsBatch(pairs);
    const enriched = data.map((a) => ({
      ...a,
      testAttempt: attemptsMap.get(`${a.userId}-${a.jobId}`) ?? null,
    }));

    return {
      data: enriched,
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
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        user: { select: { id: true, email: true, profile: true } },
        job: {
          select: { id: true, title: true, city: true, hasTest: true },
        },
      },
    });
    if (!application) return null;

    const testAttempt = await this.findBestAttempt(
      application.userId,
      application.jobId,
    );
    return { ...application, testAttempt };
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
