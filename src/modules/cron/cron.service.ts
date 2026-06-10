import cron from "node-cron";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { MailService } from "../mail/mail.service.js";

export class CronService {
  constructor(
    private prisma: PrismaClient,
    private mailService: MailService,
  ) {}

  // Start all cron jobs
  start = () => {
    this.scheduleExpiryReminder();
    this.scheduleAutoExpire();

    console.log("Cron jobs started");
  };

  // 00:00 every day — send H-1 reminder email
  private scheduleExpiryReminder = () => {
    cron.schedule("0 0 * * *", async () => {
      console.log("Running expiry reminder job...");
      await this.sendExpiryReminders();
    });
  };

  // 00:05 every day — auto-expire subscriptions
  private scheduleAutoExpire = () => {
    cron.schedule("5 0 * * *", async () => {
      console.log("Running auto-expire job...");
      await this.expireSubscriptions();
    });
  };

  // Find subscriptions expiring tomorrow, send reminder email
  private sendExpiryReminders = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const expiring = await this.prisma.subscription.findMany({
      where: {
        status: "active",
        endDate: { gte: tomorrow, lt: dayAfter },
      },
      include: {
        user: {
          select: {
            email: true,
            profile: { select: { fullName: true } },
          },
        },
        plan: { select: { name: true } },
      },
    });

    for (const sub of expiring) {
      const endDate = sub.endDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      await this.mailService
        .sendMail({
          to: sub.user.email,
          subject: "Your Lokerin subscription expires tomorrow",
          templateName: "transaction-subscription-expiry",
          context: {
            name: sub.user.profile?.fullName ?? "there",
            planName: sub.plan.name,
            endDate,
            subscribeUrl: `${process.env.BASE_URL_FE}/dashboard/subscribe`,
          },
        })
        .catch(() => {});
    }

    console.log(`Expiry reminders sent: ${expiring.length}`);
  };

  // Find expired subscriptions, update status to "expired"
  private expireSubscriptions = async () => {
    const now = new Date();

    const result = await this.prisma.subscription.updateMany({
      where: {
        status: "active",
        endDate: { lt: now },
      },
      data: { status: "expired" },
    });

    console.log(`Auto-expired subscriptions: ${result.count}`);
  };
}
