import { Job, Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { CreateJobDTO } from "./dto/create-job.dto.js";
import { UpdateJobDTO } from "./dto/update-job.dto.js";
import { QueryJobDTO } from "./dto/query-job.dto.js";

export class JobService {
  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService,
  ) {}

  private getJobOrThrow = async (
    jobId: string,
    companyId: string,
  ): Promise<Job> => {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.deletedAt) {
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

  createJob = async (companyId: string | undefined, body: CreateJobDTO) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }
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

  getJobs = async (companyId: string | undefined, query: QueryJobDTO) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }

    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 5);
    const sortBy = query.sortBy ?? "createdAt";
    const sortOrder = query.sortOrder ?? "desc";

    const where: Prisma.JobWhereInput = { companyId, deletedAt: null };

    if (query.search) {
      where.title = { contains: query.search, mode: "insensitive" };
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.city) {
      where.city = { contains: query.city, mode: "insensitive" };
    }
    if (query.isPublished !== undefined) {
      where.isPublished = query.isPublished === "true";
    }

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  getPublicJobs = async (query: QueryJobDTO) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const sortBy = query.sortBy ?? "createdAt";
    const sortOrder = query.sortOrder ?? "desc";

    const where: Prisma.JobWhereInput = {
      isPublished: true,
      deletedAt: null,
    };

    if (query.search) {
      where.title = { contains: query.search, mode: "insensitive" };
    }
    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query.city) {
      where.city = { contains: query.city, mode: "insensitive" };
    }
    if (query.companyId) {
      where.companyId = query.companyId;
    }
    if (query.excludeJobId) {
      where.id = { not: query.excludeJobId };
    }
    if (query.dateFrom && query.dateTo) {
      if (new Date(query.dateFrom) > new Date(query.dateTo)) {
        throw new ApiError("dateFrom must be before dateTo", 400);
      }
    }
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { lte: new Date(query.dateTo) }),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          company: {
            select: { id: true, name: true, city: true, logoUrl: true },
          },
          _count: { select: { applications: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  getJobById = async (jobId: string, companyId: string | undefined) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { category: { select: { id: true, name: true } } },
    });
    if (!job || job.deletedAt) throw new ApiError("Job not found", 404);
    if (job.companyId !== companyId)
      throw new ApiError("You don't have access to this job", 403);
    return job;
  };

  getPublicJobById = async (jobId: string) => {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: {
        category: { select: { id: true, name: true } },
        company: {
          select: { id: true, name: true, city: true, logoUrl: true },
        },
      },
    });
    if (!job || job.deletedAt || !job.isPublished) {
      throw new ApiError("Job not found", 404);
    }
    return job;
  };

  updateJob = async (
    jobId: string,
    companyId: string | undefined,
    body: UpdateJobDTO,
  ) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }
    await this.getJobOrThrow(jobId, companyId);

    if (body.categoryId) {
      await this.assertCategoryExists(body.categoryId);
    }

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

  togglePublish = async (jobId: string, companyId: string | undefined) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }
    const job = await this.getJobOrThrow(jobId, companyId);

    return this.prisma.job.update({
      where: { id: jobId },
      data: { isPublished: !job.isPublished },
    });
  };

  deleteJob = async (jobId: string, companyId: string | undefined) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }
    await this.getJobOrThrow(jobId, companyId);

    await this.prisma.job.update({
      where: { id: jobId },
      data: { deletedAt: new Date() },
    });

    return { message: "Job deleted successfully" };
  };

  updateJobBanner = async (
    jobId: string,
    companyId: string | undefined,
    file: Express.Multer.File,
  ) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }
    await this.getJobOrThrow(jobId, companyId);

    const result = await this.cloudinaryService.upload(file);
    const bannerUrl = result.secure_url;

    return this.prisma.job.update({
      where: { id: jobId },
      data: { bannerUrl },
    });
  };
}
