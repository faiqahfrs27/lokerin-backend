import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

export class AssessmentResultService {
  constructor(private prisma: PrismaClient) {}

  // 1. START
  startAttempt = async (userId: string, assessmentId: string) => {
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

    const result = await this.prisma.assessmentResult.create({
      data: { userId, assessmentId },
    });

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

  // 2. SUBMIT
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

  // Helper: count score
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

  // Helper: finalize attempt + auto-create badge/cert if passed
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

    return await this.prisma.$transaction(async (tx) => {
      const updated = await tx.assessmentResult.update({
        where: { id: resultId },
        data: { completedAt: new Date(), answers, score, passed: finalPassed },
      });

      if (finalPassed) {
        await tx.badgeEarned.create({
          data: { userId, assessmentResultId: resultId, assessmentId },
        });
        await tx.certificate.create({
          data: { userId, assessmentResultId: resultId, assessmentId },
        });
      }

      return updated;
    });
  };

  // 3. GET BY ID — Detail 1 attempt (owner only)
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
          },
        },
        badgeEarned: true,
        certificate: { select: { id: true, code: true, issuedAt: true } },
      },
    });
    if (!result) throw new ApiError("Result not found", 404);
    return result;
  };

  // 4. GET MY RESULTS — History attempt user
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

  // Helper: get results + check ownership
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
