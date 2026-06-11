import { Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateApplicationDTO } from "./dto/create-application.dto.js";
import { QueryApplicationDTO } from "./dto/query-application.dto.js";

export class ApplicationService {
  constructor(private prisma: PrismaClient) {}

  private validateJobForApplication = async (jobId: string) => {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { preSelectionTest: { select: { id: true } } },
    });
    if (!job) throw new ApiError("Job not found", 404);
    if (!job.isPublished) {
      throw new ApiError("Job is not open for applications", 400);
    }
    return job;
  };

  private assertUserCanApply = async (jobId: string, userId: string) => {
    const existing = await this.prisma.application.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (existing) {
      throw new ApiError("You've already applied to this job", 409);
    }
  };

  private validateTestAttempt = async (
    testAttemptId: string,
    userId: string,
    testId: string,
  ) => {
    const attempt = await this.prisma.testAttempt.findUnique({
      where: { id: testAttemptId },
    });
    if (!attempt) throw new ApiError("Test attempt not found", 404);
    if (attempt.userId !== userId) {
      throw new ApiError("This attempt doesn't belong to you", 403);
    }
    if (attempt.testId !== testId) {
      throw new ApiError("This attempt is for a different test", 400);
    }
    if (!attempt.passed) {
      throw new ApiError("You haven't passed the pre-selection test", 400);
    }
  };

  private validatePreSelectionGate = async (
    job: { preSelectionTest: { id: string } | null },
    userId: string,
    testAttemptId?: string,
  ) => {
    if (!job.preSelectionTest) return;
    if (!testAttemptId) {
      throw new ApiError("This job requires a pre-selection test", 400);
    }
    await this.validateTestAttempt(
      testAttemptId,
      userId,
      job.preSelectionTest.id,
    );
  };

  createApplication = async (
    userId: string | undefined,
    body: CreateApplicationDTO,
  ) => {
    if (!userId) throw new ApiError("Not authenticated", 401);
    const job = await this.validateJobForApplication(body.jobId);
    await this.assertUserCanApply(body.jobId, userId);
    await this.validatePreSelectionGate(job, userId, body.testAttemptId);

    return this.prisma.application.create({
      data: {
        userId,
        jobId: body.jobId,
        cvUrl: body.cvUrl,
        expectedSalary: body.expectedSalary,
      },
      include: {
        job: {
          select: { id: true, title: true, city: true, deadline: true },
        },
      },
    });
  };

  getMyApplications = async (
    userId: string | undefined,
    query: QueryApplicationDTO,
  ) => {
    if (!userId) throw new ApiError("Not authenticated", 401);

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where: Prisma.ApplicationWhereInput = { userId };
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              city: true,
              deadline: true,
              company: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { appliedAt: "desc" },
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

  getApplicationById = async (id: string, userId: string | undefined) => {
    if (!userId) throw new ApiError("Not authenticated", 401);

    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            city: true,
            deadline: true,
            description: true,
            company: { select: { id: true, name: true, city: true } },
          },
        },
        interview: true,
      },
    });
    if (!application) throw new ApiError("Application not found", 404);
    if (application.userId !== userId) {
      throw new ApiError("You don't have access to this application", 403);
    }
    return application;
  };
}
