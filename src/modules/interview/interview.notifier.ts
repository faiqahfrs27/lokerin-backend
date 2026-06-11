import type { PrismaClient } from "../../../generated/prisma/client.js";
import type { MailService } from "../mail/mail.service.js";

const formatDate = (date: Date) =>
  date.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" });

const buildContext = (itv: any) => ({
  jobTitle: itv.application.job.title,
  companyName: itv.application.job.company.name,
  scheduledAt: formatDate(itv.scheduledAt),
  location: itv.location ?? "",
  notes: itv.notes ?? "",
  applicationUrl: `${process.env.BASE_URL_FE}/applications/${itv.applicationId}`,
});

export const sendInterviewScheduleEmails = async (
  prisma: PrismaClient,
  mailService: MailService,
  interviewId: string,
) => {
  const itv = await prisma.interview.findUnique({
    where: { id: interviewId },
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
  if (!itv) return;

  const ctx = buildContext(itv);
  const userName = itv.application.user.profile?.fullName ?? "there";
  const send = (to: string, name: string) =>
    mailService
      .sendMail({
        to,
        subject: `Interview scheduled - ${itv.application.job.title}`,
        templateName: "transaction-interview-scheduled",
        context: { ...ctx, name },
      })
      .catch(() => {});

  await Promise.all([
    send(itv.application.user.email, userName),
    send(itv.application.job.company.email, itv.application.job.company.name),
  ]);
};
