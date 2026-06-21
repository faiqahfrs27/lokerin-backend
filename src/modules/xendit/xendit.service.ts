import { Invoice } from "xendit-node";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

const invoiceClient = new Invoice({
  secretKey: process.env.XENDIT_SECRET_KEY!,
});

const SUBSCRIPTION_DAYS = 30;

export class XenditService {
  constructor(private prisma: PrismaClient) {}

  createInvoice = async (userId: string, planId: string) => {
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { id: planId, deletedAt: null },
    });
    if (!plan) throw new ApiError("Subscription plan not found", 404);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, profile: { select: { fullName: true } } },
    });
    if (!user) throw new ApiError("User not found", 404);

    // external_id format: subscription_{userId}_{planId}_{timestamp}
    const externalId = `subscription_${userId}_${planId}_${Date.now()}`;

    const invoice = await invoiceClient.createInvoice({
      data: {
        externalId,
        amount: plan.price,
        payerEmail: user.email,
        description: `Lokerin ${plan.name} Subscription`,
        successRedirectUrl: `${process.env.BASE_URL_FE}/dashboard/subscription`,
        failureRedirectUrl: `${process.env.BASE_URL_FE}/dashboard/subscribe`,
        currency: "IDR",
        items: [
          {
            name: plan.name,
            quantity: 1,
            price: plan.price,
          },
        ],
      },
    });

    // Save pending subscription + payment record to database
    const now = new Date();
    const end = new Date(now.getTime() + SUBSCRIPTION_DAYS * 86400000);

    await this.prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
        data: {
          userId,
          planId,
          status: "expired",
          startDate: now,
          endDate: end,
        },
      });
      await tx.payment.create({
        data: {
          subscriptionId: sub.id,
          userId,
          amount: plan.price,
          method: "xendit",
          status: "pending",
          proofUrl: invoice.invoiceUrl,
        },
      });
    });

    return { invoiceUrl: invoice.invoiceUrl };
  };

  handleWebhook = async (callbackToken: string, body: XenditInvoiceBody) => {
    if (callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      throw new ApiError("Invalid callback token", 401);
    }

    if (body.status !== "PAID") return { message: "Ignored" };

    const parts = body.external_id.split("_");
    const userId = parts[1];
    const planId = parts[2];

    if (!userId || !planId) throw new ApiError("Invalid external ID", 400);

    const now = new Date();
    const end = new Date(now.getTime() + SUBSCRIPTION_DAYS * 86400000);

    await this.prisma.$transaction(
      async (tx) => {
        const sub = await tx.subscription.findFirst({
          where: { userId, planId, status: "expired" },
          orderBy: { createdAt: "desc" },
        });
        if (!sub) return;

        await tx.subscription.update({
          where: { id: sub.id },
          data: { status: "active", startDate: now, endDate: end },
        });

        await tx.payment.updateMany({
          where: {
            subscriptionId: sub.id,
            status: "pending",
            method: "xendit",
          },
          data: { status: "approved", approvedAt: now },
        });
      },
      {
        timeout: 10000,
        maxWait: 5000,
      },
    );

    return { message: "OK" };
  };
}

export interface XenditInvoiceBody {
  id: string;
  external_id: string;
  status: string;
  amount: number;
  paid_amount: number;
  payment_method: string;
  payer_email: string;
}
