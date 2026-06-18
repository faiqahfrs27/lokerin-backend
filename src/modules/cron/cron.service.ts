import cron from "node-cron";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { MailService } from "../mail/mail.service.js";

export class CronService {
  constructor(
    private prisma: PrismaClient,
    private mailService: MailService,
  ) {}

  start = () => {
    this.scheduleExpiryReminder();
    this.scheduleAutoExpire();
    this.scheduleInterviewReminder();
    console.log("Cron jobs started");
  };

  private scheduleExpiryReminder = () => {
    cron.schedule("0 0 * * *", async () => {
      console.log("Running expiry reminder job...");
      await this.sendExpiryReminders();
    });
  };

  private scheduleAutoExpire = () => {
    cron.schedule("5 0 * * *", async () => {
      console.log("Running auto-expire job...");
      await this.expireSubscriptions();
    });
  };

  private scheduleInterviewReminder = () => {
    cron.schedule("30 0 * * *", async () => {
      console.log("Running interview reminder job...");
      await this.sendInterviewReminders();
    });
  };

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

  private sendInterviewReminders = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    const upcoming = await this.prisma.interview.findMany({
      where: {
        scheduledAt: { gte: tomorrow, lt: dayAfter },
        reminderSent: false,
        deletedAt: null,
      },
      include: {
        application: {
          include: {
            user: {
              select: {
                email: true,
                profile: { select: { fullName: true } },
              },
            },
            job: {
              select: {
                title: true,
                company: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });

    for (const itv of upcoming) {
      await this.sendOneInterviewReminder(itv);
      await this.prisma.interview.update({
        where: { id: itv.id },
        data: { reminderSent: true },
      });
    }
    console.log(`Interview reminders sent: ${upcoming.length}`);
  };

  private sendOneInterviewReminder = async (itv: any) => {
    const scheduledAt = itv.scheduledAt.toLocaleString("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
    });
    const ctx = {
      jobTitle: itv.application.job.title,
      companyName: itv.application.job.company.name,
      scheduledAt,
      location: itv.location ?? "",
      notes: itv.notes ?? "",
      applicationUrl: `${process.env.BASE_URL_FE}/applications/${itv.applicationId}`,
    };
    const userName = itv.application.user.profile?.fullName ?? "there";
    await Promise.all([
      this.mailService
        .sendMail({
          to: itv.application.user.email,
          subject: `Reminder: Interview tomorrow - ${itv.application.job.title}`,
          templateName: "transaction-interview-reminder",
          context: { ...ctx, name: userName },
        })
        .catch(() => {}),
      this.mailService
        .sendMail({
          to: itv.application.job.company.email,
          subject: `Reminder: Interview tomorrow with ${userName}`,
          templateName: "transaction-interview-reminder",
          context: { ...ctx, name: itv.application.job.company.name },
        })
        .catch(() => {}),
    ]);
  };

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
