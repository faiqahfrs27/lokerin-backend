import { PrismaClient } from "../../../generated/prisma/client.js";

export class BadgeService {
  constructor(private prisma: PrismaClient) {}

  getMyBadges = async (userId: string) => {
    return await this.prisma.badgeEarned.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
      select: {
        id: true,
        earnedAt: true,
        assessment: {
          select: {
            id: true,
            title: true,
            skillCategory: true,
            badgePhoto: true,
          },
        },
        result: {
          select: { score: true },
        },
      },
    });
  };
}
