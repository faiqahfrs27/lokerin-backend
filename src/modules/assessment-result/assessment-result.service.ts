import { Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { syncCredentials } from "./credential.helper.js";

type TxClient = Prisma.TransactionClient;

export class AssessmentResultService {
  constructor(private prisma: PrismaClient) {}

  startAttempt = async (userId: string, assessmentId: string) => {
    const access = await this.canAccessAssessment(userId, assessmentId);
    if (!access.allowed) {
      throw new ApiError(
        access.reason === "no_subscription"
          ? "Active subscription required to take assessments"
          : "Assessment slot limit reached for this subscription cycle",
        403,
      );
    }

    const assessment = await this.prisma.skillAssessment.findFirst({
      where: { id: assessmentId, isPublished: true, deletedAt: null },
      include: {
        questions: {
          where: { deletedAt: null },
          select: { id: true, question: true, options: true },
        },
      },
    });
    if (!assessment)
      throw new ApiError("Assessment not found or not published", 404);

    const existing = await this.prisma.assessmentResult.findFirst({
      where: { userId, assessmentId, completedAt: null },
      orderBy: { startedAt: "desc" },
    });
    const result =
      existing ??
      (await this.prisma.assessmentResult.create({
        data: { userId, assessmentId },
      }));

    return {
      resultId: result.id,
      startedAt: result.startedAt,
      durationMin: assessment.durationMin,
      assessment: {
        id: assessment.id,
        title: assessment.title,
        skillCategory: assessment.skillCategory,
        passingScore: assessment.passingScore,
      },
      questions: assessment.questions,
    };
  };

  submitAnswers = async (
    userId: string,
    resultId: string,
    answers: Record<string, number>,
  ) => {
    const result = await this.getResultOwned(userId, resultId);

    if (result.completedAt) {
      throw new ApiError("This attempt has already been submitted", 400);
    }
    const { score, passed } = await this.calculateScore(
      result.assessmentId,
      answers,
      result.assessment.passingScore,
    );
    const elapsedMs = Date.now() - result.startedAt.getTime();
    const maxAllowedMs = result.assessment.durationMin * 60 * 1000 + 10_000;
    const wasOverTime = elapsedMs > maxAllowedMs;

    return await this.finalizeAttempt(
      resultId,
      userId,
      result.assessmentId,
      answers,
      score,
      passed,
      wasOverTime,
    );
  };

  getResultById = async (userId: string, resultId: string) => {
    const result = await this.prisma.assessmentResult.findFirst({
      where: { id: resultId, userId },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            skillCategory: true,
            passingScore: true,
            badgePhoto: true,
            questions: {
              where: { deletedAt: null },
              select: {
                id: true,
                question: true,
                options: true,
                correctIndex: true,
              },
            },
          },
        },
        badgeEarned: true,
        certificate: { select: { id: true, code: true, issuedAt: true } },
      },
    });
    if (!result) throw new ApiError("Result not found", 404);
    return result;
  };

  getMyResults = async (userId: string) => {
    return await this.prisma.assessmentResult.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            skillCategory: true,
            badgePhoto: true,
          },
        },
        certificate: { select: { code: true } },
      },
    });
  };

  getUsage = async (userId: string) => {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, status: "active" },
      include: { plan: { select: { name: true } } },
    });
    if (!sub) {
      return {
        unlockedAssessmentIds: [] as string[],
        count: 0,
        limit: 0,
        canTake: false,
        reason: "no_subscription" as const,
      };
    }

    const isPro = sub.plan.name.toLowerCase().includes("professional");
    if (isPro) {
      return {
        unlockedAssessmentIds: [] as string[],
        count: 0,
        limit: null,
        canTake: true,
        reason: "unlimited" as const,
      };
    }

    const completed = await this.prisma.assessmentResult.findMany({
      where: {
        userId,
        createdAt: { gte: sub.startDate },
        completedAt: { not: null },
      },
      select: { assessmentId: true },
      distinct: ["assessmentId"],
    });

    const unlockedAssessmentIds = completed.map((c) => c.assessmentId);
    const limit = 2;
    const canTake = unlockedAssessmentIds.length < limit;

    return {
      unlockedAssessmentIds,
      count: unlockedAssessmentIds.length,
      limit,
      canTake,
      reason: (canTake ? "ok" : "limit_reached") as "ok" | "limit_reached",
    };
  };

  private canAccessAssessment = async (
    userId: string,
    assessmentId: string,
  ) => {
    const usage = await this.getUsage(userId);

    if (usage.reason === "no_subscription") {
      return { allowed: false, reason: usage.reason };
    }
    if (usage.reason === "unlimited") {
      return { allowed: true, reason: usage.reason };
    }
    if (usage.unlockedAssessmentIds.includes(assessmentId)) {
      return { allowed: true, reason: "retake" as const };
    }
    if (usage.canTake) {
      return { allowed: true, reason: "new_slot" as const };
    }
    return { allowed: false, reason: "limit_reached" as const };
  };

  private calculateScore = async (
    assessmentId: string,
    answers: Record<string, number>,
    passingScore: number,
  ) => {
    const questions = await this.prisma.assessmentQuestion.findMany({
      where: { assessmentId, deletedAt: null },
      select: { id: true, correctIndex: true },
    });
    let correctCount = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctIndex) correctCount++;
    }
    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= passingScore;
    return { score, passed };
  };

  private finalizeAttempt = async (
    resultId: string,
    userId: string,
    assessmentId: string,
    answers: Record<string, number>,
    score: number,
    passed: boolean,
    wasOverTime: boolean,
  ) => {
    const finalPassed = passed && !wasOverTime;

    return await this.prisma.$transaction(async (tx: TxClient) => {
      const updated = await tx.assessmentResult.update({
        where: { id: resultId },
        data: { completedAt: new Date(), answers, score, passed: finalPassed },
      });

      if (finalPassed) {
        await syncCredentials(tx, userId, assessmentId, resultId, score);
      }

      return updated;
    });
  };

  private getResultOwned = async (userId: string, resultId: string) => {
    const result = await this.prisma.assessmentResult.findFirst({
      where: { id: resultId, userId },
      include: {
        assessment: { select: { durationMin: true, passingScore: true } },
      },
    });
    if (!result) throw new ApiError("Result not found", 404);
    return result;
  };
}
