import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateJobDTO } from "./dto/create-job.dto.js";
import { UpdateJobDTO } from "./dto/update-job.dto.js";

export class JobService {
  constructor(private prisma: PrismaClient) {}

  createJob = async (companyId: string, body: CreateJobDTO) => {
    // Pastikan category-nya ada di DB
    const category = await this.prisma.jobCategory.findUnique({
      where: { id: body.categoryId },
    });
    if (!category) {
      throw new ApiError("Job category not found", 404);
    }

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

    if (!job) {
      throw new ApiError("Job not found", 404);
    }

    // Ownership check: admin cuma boleh akses job punya company-nya sendiri
    if (job.companyId !== companyId) {
      throw new ApiError("You don't have access to this job", 403);
    }

    return job;
  };

  updateJob = async (
    jobId: string,
    companyId: string,
    body: UpdateJobDTO,
  ) => {
    const existing = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!existing) {
      throw new ApiError("Job not found", 404);
    }

    if (existing.companyId !== companyId) {
      throw new ApiError("You don't have access to this job", 403);
    }

    // Kalo categoryId diubah, validasi exists
    if (body.categoryId) {
      const category = await this.prisma.jobCategory.findUnique({
        where: { id: body.categoryId },
      });
      if (!category) {
        throw new ApiError("Job category not found", 404);
      }
    }

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.deadline !== undefined && {
          deadline: new Date(body.deadline),
        }),
        ...(body.bannerUrl !== undefined && { bannerUrl: body.bannerUrl }),
        ...(body.salary !== undefined && { salary: body.salary }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.hasTest !== undefined && { hasTest: body.hasTest }),
      },
    });
  };

  deleteJob = async (jobId: string, companyId: string) => {
    const existing = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!existing) {
      throw new ApiError("Job not found", 404);
    }

    if (existing.companyId !== companyId) {
      throw new ApiError("You don't have access to this job", 403);
    }

    await this.prisma.job.delete({ where: { id: jobId } });

    return { message: "Job deleted successfully" };
  };
}