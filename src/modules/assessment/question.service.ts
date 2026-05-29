import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateQuestionDTO } from "./dto/create-question.dto.js";
import { UpdateQuestionDTO } from "./dto/update-question.dto.js";

export class QuestionService {
  constructor(private prisma: PrismaClient) {}

  private ensureAssessmentExists = async (assessmentId: string) => {
    const assessment = await this.prisma.skillAssessment.findFirst({
      where: { id: assessmentId, deletedAt: null },
    });
    if (!assessment) throw new ApiError("Assessment not found", 404);
    return assessment;
  };

  private validateCorrectIndex = (options: string[], correctIndex: number) => {
    if (correctIndex >= options.length) {
      throw new ApiError("correctIndex is out of options range", 400);
    }
  };

  addQuestion = async (assessmentId: string, body: CreateQuestionDTO) => {
    await this.ensureAssessmentExists(assessmentId);
    this.validateCorrectIndex(body.options, body.correctIndex);
    return await this.prisma.assessmentQuestion.create({
      data: { ...body, assessmentId },
    });
  };

  deleteQuestion = async (questionId: string) => {
    const question = await this.prisma.assessmentQuestion.findFirst({
      where: { id: questionId, deletedAt: null },
    });
    if (!question) throw new ApiError("Question not found", 404);
    return await this.prisma.assessmentQuestion.update({
      where: { id: questionId },
      data: { deletedAt: new Date() },
    });
  };

  updateQuestion = async (questionId: string, body: UpdateQuestionDTO) => {
    const question = await this.prisma.assessmentQuestion.findFirst({
      where: { id: questionId, deletedAt: null },
    });
    if (!question) throw new ApiError("Question not found", 404);

    const options = body.options ?? question.options;
    const correctIndex = body.correctIndex ?? question.correctIndex;
    this.validateCorrectIndex(options, correctIndex);

    return await this.prisma.assessmentQuestion.update({
      where: { id: questionId },
      data: body,
    });
  };
}
