import { Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateTestDTO } from "./dto/create-test.dto.js";
import { UpdateTestDTO } from "./dto/update-test.dto.js";
import { CreateQuestionDTO } from "./dto/create-question.dto.js";
import { UpdateQuestionDTO } from "./dto/update-question.dto.js";
import { QueryTestDTO } from "./dto/query-test.dto.js";
import { SubmitAttemptDTO } from "./dto/submit-attempt.dto.js";

export class PreSelectionTestService {
  constructor(private prisma: PrismaClient) {}

  private assertTestOwnership = async (testId: string, companyId: string) => {
    const test = await this.prisma.preSelectionTest.findUnique({
      where: { id: testId },
      include: { job: { select: { companyId: true } } },
    });
    if (!test) throw new ApiError("Test not found", 404);
    if (test.job.companyId !== companyId) {
      throw new ApiError("You don't have access to this test", 403);
    }
    return test;
  };

  private assertQuestionOwnership = async (
    questionId: string,
    companyId: string,
  ) => {
    const question = await this.prisma.testQuestion.findUnique({
      where: { id: questionId },
      include: { test: { include: { job: { select: { companyId: true } } } } },
    });
    if (!question) throw new ApiError("Question not found", 404);
    if (question.test.job.companyId !== companyId) {
      throw new ApiError("You don't have access to this question", 403);
    }
    return question;
  };

  private validateJobForTest = async (jobId: string, companyId: string) => {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { preSelectionTest: true },
    });
    if (!job) throw new ApiError("Job not found", 404);
    if (job.companyId !== companyId) {
      throw new ApiError("You don't have access to this job", 403);
    }
    if (job.preSelectionTest) {
      throw new ApiError("This job already has a test", 409);
    }
  };

  private gradeAttempt = (
    questions: { id: string; correctIndex: number }[],
    answers: { questionId: string; selectedIndex: number }[],
  ) => {
    const correctMap = new Map(questions.map((q) => [q.id, q.correctIndex]));
    let correctCount = 0;
    for (const a of answers) {
      if (correctMap.get(a.questionId) === a.selectedIndex) correctCount++;
    }
    return correctCount;
  };

  createTest = async (companyId: string | undefined, body: CreateTestDTO) => {
    if (!companyId) throw new ApiError("Not linked to a company", 403);
    await this.validateJobForTest(body.jobId, companyId);

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.preSelectionTest.create({
        data: {
          jobId: body.jobId,
          title: body.title,
          description: body.description,
          passingScore: body.passingScore,
          durationMinutes: body.durationMinutes,
          allowRetake: body.allowRetake ?? true,
        },
      });
      await tx.job.update({
        where: { id: body.jobId },
        data: { hasTest: true },
      });
      return created;
    });
  };

  getTests = async (companyId: string | undefined, query: QueryTestDTO) => {
    if (!companyId) throw new ApiError("Not linked to a company", 403);
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const where: Prisma.PreSelectionTestWhereInput = { job: { companyId } };
    if (query.search) {
      where.title = { contains: query.search, mode: "insensitive" };
    }

    const [data, total] = await Promise.all([
      this.prisma.preSelectionTest.findMany({
        where,
        include: {
          job: { select: { id: true, title: true } },
          _count: { select: { questions: true, attempts: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.preSelectionTest.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  };

  getTestById = async (testId: string, companyId: string | undefined) => {
    if (!companyId) throw new ApiError("Not linked to a company", 403);
    await this.assertTestOwnership(testId, companyId);
    return this.prisma.preSelectionTest.findUnique({
      where: { id: testId },
      include: {
        job: { select: { id: true, title: true } },
        questions: { orderBy: { order: "asc" } },
        _count: { select: { attempts: true } },
      },
    });
  };

  getTestForJob = async (jobId: string, userId?: string) => {
    const test = await this.prisma.preSelectionTest.findUnique({
      where: { jobId },
      include: {
        job: { select: { id: true, title: true, isPublished: true } },
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            questionText: true,
            options: true,
            order: true,
          },
        },
      },
    });
    if (!test) throw new ApiError("Test not found for this job", 404);
    if (!test.job.isPublished) {
      throw new ApiError("Job is not published", 404);
    }

    let myAttempt = null;
    if (userId) {
      myAttempt = await this.prisma.testAttempt.findFirst({
        where: { userId, testId: test.id },
        orderBy: { score: "desc" },
        select: {
          id: true,
          score: true,
          passed: true,
          attemptedAt: true,
        },
        take: 1,
      });
    }

    return { ...test, myAttempt };
  };

  updateTest = async (
    testId: string,
    companyId: string | undefined,
    body: UpdateTestDTO,
  ) => {
    if (!companyId) throw new ApiError("Not linked to a company", 403);
    await this.assertTestOwnership(testId, companyId);
    return this.prisma.preSelectionTest.update({
      where: { id: testId },
      data: {
        title: body.title,
        description: body.description,
        passingScore: body.passingScore,
        durationMinutes: body.durationMinutes,

        ...(body.allowRetake !== undefined && {
          allowRetake: body.allowRetake,
        }),
      },
    });
  };

  deleteTest = async (testId: string, companyId: string | undefined) => {
    if (!companyId) throw new ApiError("Not linked to a company", 403);
    const test = await this.assertTestOwnership(testId, companyId);

    await this.prisma.$transaction(async (tx) => {
      await tx.preSelectionTest.delete({ where: { id: testId } });
      await tx.job.update({
        where: { id: test.jobId },
        data: { hasTest: false },
      });
    });
    return { message: "Test deleted successfully" };
  };

  addQuestion = async (
    testId: string,
    companyId: string | undefined,
    body: CreateQuestionDTO,
  ) => {
    if (!companyId) throw new ApiError("Not linked to a company", 403);
    await this.assertTestOwnership(testId, companyId);

    if (body.correctIndex >= body.options.length) {
      throw new ApiError("correctIndex out of range", 400);
    }

    return this.prisma.testQuestion.create({
      data: {
        testId,
        questionText: body.questionText,
        options: body.options,
        correctIndex: body.correctIndex,
        order: body.order ?? 0,
      },
    });
  };

  updateQuestion = async (
    questionId: string,
    companyId: string | undefined,
    body: UpdateQuestionDTO,
  ) => {
    if (!companyId) throw new ApiError("Not linked to a company", 403);
    await this.assertQuestionOwnership(questionId, companyId);

    if (
      body.options &&
      body.correctIndex !== undefined &&
      body.correctIndex >= body.options.length
    ) {
      throw new ApiError("correctIndex out of range", 400);
    }

    return this.prisma.testQuestion.update({
      where: { id: questionId },
      data: {
        questionText: body.questionText,
        options: body.options,
        correctIndex: body.correctIndex,
        order: body.order,
      },
    });
  };

  deleteQuestion = async (
    questionId: string,
    companyId: string | undefined,
  ) => {
    if (!companyId) throw new ApiError("Not linked to a company", 403);
    await this.assertQuestionOwnership(questionId, companyId);
    await this.prisma.testQuestion.delete({ where: { id: questionId } });
    return { message: "Question deleted successfully" };
  };

  submitAttempt = async (
    testId: string,
    userId: string | undefined,
    body: SubmitAttemptDTO,
  ) => {
    if (!userId) throw new ApiError("Not authenticated", 401);

    const test = await this.prisma.preSelectionTest.findUnique({
      where: { id: testId },
      include: { questions: { select: { id: true, correctIndex: true } } },
    });
    if (!test) throw new ApiError("Test not found", 404);
    if (test.questions.length === 0) {
      throw new ApiError("This test has no questions", 400);
    }

    if (!test.allowRetake) {
      const existingAttempt = await this.prisma.testAttempt.findFirst({
        where: { userId, testId: test.id },
      });
      if (existingAttempt) {
        throw new ApiError(
          "This test does not allow retake. Your previous attempt is final.",
          400,
        );
      }
    }

    const correctCount = this.gradeAttempt(test.questions, body.answers);
    const totalQuestions = test.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= test.passingScore;

    const attempt = await this.prisma.testAttempt.create({
      data: {
        testId,
        userId,
        score,
        passed,
        answers: body.answers as unknown as Prisma.InputJsonValue,
        completedAt: new Date(),
      },
    });

    return {
      attemptId: attempt.id,
      score,
      passed,
      passingScore: test.passingScore,
      totalQuestions,
      correctAnswers: correctCount,
    };
  };
}
