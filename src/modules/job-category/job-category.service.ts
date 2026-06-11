import { PrismaClient } from "../../../generated/prisma/client.js";
import { CreateJobCategoryDTO } from "./dto/create-job-category.dto.js";

export class JobCategoryService {
  constructor(private prisma: PrismaClient) {}

  getAll = async () => {
    const categories = await this.prisma.jobCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return { data: categories };
  };

  create = async (body: CreateJobCategoryDTO) => {
    const name = body.name.trim();
    const existing = await this.prisma.jobCategory.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true, name: true },
    });
    if (existing) {
      return existing;
    }
    return this.prisma.jobCategory.create({
      data: { name },
      select: { id: true, name: true },
    });
  };
}
