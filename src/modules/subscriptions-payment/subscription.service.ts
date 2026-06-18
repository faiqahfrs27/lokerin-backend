import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { MailService } from "../mail/mail.service.js";
import { SubscribersHelper } from "./subscribers.helper.js";

const SUBSCRIPTION_DAYS = 30;

export class SubscriptionService {
  private subscribersHelper: SubscribersHelper;

  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService,
    private mailService: MailService,
  ) {
    this.subscribersHelper = new SubscribersHelper(prisma);
  }
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

  getPayments = async (query: { page?: number; limit?: number }) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              email: true,
              profile: { select: { fullName: true } },
            },
          },
          subscription: { select: { plan: { select: { name: true } } } },
        },
      }),
      this.prisma.payment.count(),
    ]);

    return {
      data: payments,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  };

  getSubscribers = async (query: { page?: number; limit?: number }) => {
    return await this.subscribersHelper.getSubscribers(query);
  };
  getSubscriberStats = async () => {
    return await this.subscribersHelper.getSubscriberStats();
  };

  approvePayment = async (paymentId: string, devId: string) => {
    const payment = await this.getPendingPayment(paymentId);
    const now = new Date();
    const end = new Date(now.getTime() + SUBSCRIPTION_DAYS * 86400000);

    const [, subscription] = await this.prisma.$transaction(async (tx) => {
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: { status: "approved", approvedAt: now, approvedBy: devId },
      });
      const updatedSub = await tx.subscription.update({
        where: { id: payment.subscriptionId },
        data: { status: "active", startDate: now, endDate: end },
        include: {
          user: {
            select: { email: true, profile: { select: { fullName: true } } },
          },
          plan: { select: { name: true, price: true } },
        },
      });
      return [updatedPayment, updatedSub];
    });

    const endDate = end.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    this.mailService
      .sendMail({
        to: subscription.user.email,
        subject: "Your Lokerin subscription is now active!",
        templateName: "transaction-payment-approved",
        context: {
          name: subscription.user.profile?.fullName ?? "there",
          planName: subscription.plan.name,
          amount: subscription.plan.price.toLocaleString("id-ID"),
          endDate,
          dashboardUrl: `${process.env.BASE_URL_FE}/dashboard/subscription`,
        },
      })
      .catch(() => {});

    return subscription;
  };

  rejectPayment = async (paymentId: string) => {
    await this.getPendingPayment(paymentId);

    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: "rejected" },
      include: {
        user: {
          select: { email: true, profile: { select: { fullName: true } } },
        },
        subscription: { include: { plan: { select: { name: true } } } },
      },
    });

    this.mailService
      .sendMail({
        to: payment.user.email,
        subject: "Your payment not approved",
        templateName: "transaction-payment-rejected",
        context: {
          name: payment.user.profile?.fullName ?? "there",
          planName: payment.subscription.plan.name,
          subscribeUrl: `${process.env.BASE_URL_FE}/dashboard/subscribe`,
        },
      })
      .catch((err) => console.error("Reject email error:", err.message));

    return payment;
  };

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
