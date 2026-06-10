import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";

const SUBSCRIPTION_DAYS = 30;

export class SubscriptionService {
  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService,
  ) {}

  // USER: subscribe to a plan + upload payment proof
  subscribe = async (
    userId: string,
    planId: string,
    file: Express.Multer.File,
  ) => {
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { id: planId, deletedAt: null },
    });
    if (!plan) throw new ApiError("Subscription plan not found", 404);

    const result = await this.cloudinaryService.upload(file);
    return await this.createPendingSubscription(
      userId,
      plan.id,
      plan.price,
      result.secure_url,
    );
  };

  // Helper: create subscription + payment (both pending) in one transaction
  private createPendingSubscription = async (
    userId: string,
    planId: string,
    price: number,
    proofUrl: string,
  ) => {
    const now = new Date();
    const end = new Date(now.getTime() + SUBSCRIPTION_DAYS * 86400000);

    return await this.prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          userId,
          planId,
          status: "expired",
          startDate: now,
          endDate: end,
        },
      });
      const payment = await tx.payment.create({
        data: { subscriptionId: sub.id, userId, amount: price, proofUrl },
      });
      return { subscription: sub, payment };
    });
  };

  // USER: get current subscription status
  getMySubscription = async (userId: string) => {
    return await this.prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        plan: { select: { name: true, price: true, features: true } },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true, proofUrl: true, createdAt: true },
        },
      },
    });
  };

  // DEV: list all payments for approval
  getPayments = async () => {
    return await this.prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        subscription: { select: { plan: { select: { name: true } } } },
      },
    });
  };

  // DEV: approve payment, then activate subscription for 30 days
  approvePayment = async (paymentId: string, devId: string) => {
    const payment = await this.getPendingPayment(paymentId);
    const now = new Date();
    const end = new Date(now.getTime() + SUBSCRIPTION_DAYS * 86400000);

    return await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: "approved", approvedAt: now, approvedBy: devId },
      });
      return await tx.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: "active", startDate: now, endDate: end },
      });
    });
  };

  // DEV: reject payment
  rejectPayment = async (paymentId: string) => {
    await this.getPendingPayment(paymentId);
    return await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: "rejected" },
    });
  };

  // Helper: ensure payment exists and is still pending
  private getPendingPayment = async (paymentId: string) => {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new ApiError("Payment not found", 404);
    if (payment.status !== "pending") {
      throw new ApiError("Payment already processed", 400);
    }
    return payment;
  };
}
