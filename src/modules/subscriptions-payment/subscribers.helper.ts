import { PrismaClient } from "../../../generated/prisma/client.js";

export class SubscribersHelper {
  constructor(private prisma: PrismaClient) {}

  // DEV: get all subscribers with their payment history
  getSubscribers = async (query: { page?: number; limit?: number }) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { email: true, profile: { select: { fullName: true } } },
          },
          plan: { select: { name: true } },
          payments: {
            where: { status: "approved" },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              amount: true,
              method: true,
              status: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.subscription.count(),
    ]);

    const data = subscriptions.map((sub) => ({
      id: sub.id,
      user: {
        fullName: sub.user.profile?.fullName ?? "—",
        email: sub.user.email,
      },
      plan: sub.plan.name,
      startDate: sub.startDate,
      endDate: sub.endDate,
      status: sub.status,
      paymentHistory: sub.payments,
    }));

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  };

  // DEV: get summary stats for dashboard
  getSubscriberStats = async () => {
    const [total, active, standardCount, professionalCount] = await Promise.all(
      [
        this.prisma.subscription.count(),
        this.prisma.subscription.count({ where: { status: "active" } }),
        this.prisma.subscription.count({
          where: { status: "active", plan: { name: { contains: "Standard" } } },
        }),
        this.prisma.subscription.count({
          where: {
            status: "active",
            plan: { name: { contains: "Professional" } },
          },
        }),
      ],
    );

    return { total, active, standardCount, professionalCount };
  };
}
