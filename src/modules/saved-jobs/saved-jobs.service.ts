import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class SavedJobsService {
  constructor(private prisma: PrismaClient) {}

  saveJob = async (userId: string | undefined, jobId: string) => {
    if (!userId) throw new ApiError("Not authenticated", 401);

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || !job.isPublished) throw new ApiError("Job not found", 404);

    const existing = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (existing) throw new ApiError("Job already saved", 409);

    return this.prisma.savedJob.create({
      data: { userId, jobId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            city: true,
            salary: true,
            deadline: true,
            category: { select: { id: true, name: true } },
            company: { select: { id: true, name: true, logoUrl: true } },
          },
        },
      },
    });
  };

  unsaveJob = async (userId: string | undefined, jobId: string) => {
    if (!userId) throw new ApiError("Not authenticated", 401);

    const saved = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    });
    if (!saved) throw new ApiError("Saved job not found", 404);

    await this.prisma.savedJob.delete({
      where: { userId_jobId: { userId, jobId } },
    });

    return { message: "Job removed from saved" };
  };

  getSavedJobs = async (userId: string | undefined) => {
    if (!userId) throw new ApiError("Not authenticated", 401);

    const data = await this.prisma.savedJob.findMany({
      where: { userId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            city: true,
            salary: true,
            deadline: true,
            hasTest: true,
            createdAt: true,
            tags: true,
            category: { select: { id: true, name: true } },
            company: {
              select: { id: true, name: true, logoUrl: true, city: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return data;
  };
}
