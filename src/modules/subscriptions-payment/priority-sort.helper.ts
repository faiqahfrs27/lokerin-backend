import { PrismaClient } from "../../../generated/prisma/client.js";

export class PrioritySortHelper {
  constructor(private prisma: PrismaClient) {}

  private getPriorityUserIds = async (
    userIds: string[],
  ): Promise<Set<string>> => {
    if (userIds.length === 0) return new Set();

    const subs = await this.prisma.subscription.findMany({
      where: {
        userId: { in: userIds },
        status: "active",
        plan: { name: { contains: "Professional", mode: "insensitive" } },
      },
      select: { userId: true },
    });

    return new Set(subs.map((s) => s.userId));
  };

  applyPriorityOrder = async <T extends { userId: string }>(
    items: T[],
  ): Promise<T[]> => {
    const userIds = items.map((a) => a.userId);
    const priorityUserIds = await this.getPriorityUserIds(userIds);

    return [...items].sort((a, b) => {
      const aPriority = priorityUserIds.has(a.userId) ? 0 : 1;
      const bPriority = priorityUserIds.has(b.userId) ? 0 : 1;
      return aPriority - bPriority;
    });
  };
}
