import { Job, PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateJobDTO } from "./dto/create-job.dto.js";
import { UpdateJobDTO } from "./dto/update-job.dto.js";

export class JobService {
  constructor(private prisma: PrismaClient) {}

  private getJobOrThrow = async (
    jobId: string,
    companyId: string,
  ): Promise<Job> => {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new ApiError("Job not found", 404);
    }

    if (job.companyId !== companyId) {
      throw new ApiError("You don't have access to this job", 403);
    }

    return job;
  };

  private assertCategoryExists = async (categoryId: string): Promise<void> => {
    const category = await this.prisma.jobCategory.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!category) {
      throw new ApiError("Job category not found", 404);
    }
  };

  createJob = async (companyId: string, body: CreateJobDTO) => {
    await this.assertCategoryExists(body.categoryId);

    return this.prisma.job.create({
      data: {
        companyId,
        categoryId: body.categoryId,
        title: body.title,
        description: body.description,
        city: body.city,
        deadline: new Date(body.deadline),
        bannerUrl: body.bannerUrl,
        salary: body.salary,
        tags: body.tags,
        hasTest: body.hasTest ?? false,
      },
    });
  };

  getJobById = async (jobId: string, companyId: string) => {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!job) throw new ApiError("Job not found", 404);
    if (job.companyId !== companyId)
      throw new ApiError("You don't have access to this job", 403);
    return job;
  };

  updateJob = async (jobId: string, companyId: string, body: UpdateJobDTO) => {
    await this.getJobOrThrow(jobId, companyId);

    if (body.categoryId) {
      await this.assertCategoryExists(body.categoryId);
    }

    // Prisma treats `undefined` as "don't update this field" sejak v3.
    // Jadi ga perlu conditional spread, cukup pass langsung.
    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        title: body.title,
        description: body.description,
        categoryId: body.categoryId,
        city: body.city,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        bannerUrl: body.bannerUrl,
        salary: body.salary,
        tags: body.tags,
        hasTest: body.hasTest,
      },
    });
  };

  deleteJob = async (jobId: string, companyId: string) => {
    await this.getJobOrThrow(jobId, companyId);

    await this.prisma.job.delete({ where: { id: jobId } });

    return { message: "Job deleted successfully" };
  };
}
