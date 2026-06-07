import { PrismaClient } from "../../../generated/prisma/client.js";

export class JobCategoryService {
  constructor(private prisma: PrismaClient) {}

  getAll = async () => {
    const categories = await this.prisma.jobCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return { data: categories };
  };
}
