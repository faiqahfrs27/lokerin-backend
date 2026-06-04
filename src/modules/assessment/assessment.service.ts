import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateAssessmentDTO } from "./dto/create-assessment.dto.js";
import { UpdateAssessmentDTO } from "./dto/update-assessment.dto.js";

export class AssessmentService {
  constructor(private prisma: PrismaClient) {}

  // ===== USER-FACING =====
  getPublishedAssessments = async () => {
    return await this.prisma.skillAssessment.findMany({
      where: {
        deletedAt: null,
        isPublished: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        skillCategory: true,
        passingScore: true,
        durationMin: true,
        badgePhoto: true,
        createdAt: true,
        _count: { select: { questions: true } },
      },
    });
  };

  // ===== DEV-ONLY =====
  getAssessments = async () => {
    return await this.prisma.skillAssessment.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { questions: true } } },
    });
  };

  getAssessmentById = async (id: string) => {
    const assessment = await this.prisma.skillAssessment.findFirst({
      where: { id, deletedAt: null },
      include: { questions: { where: { deletedAt: null } } },
    });
    if (!assessment) throw new ApiError("Assessment not found", 404);
    return assessment;
  };

  createAssessment = async (body: CreateAssessmentDTO) => {
    return await this.prisma.skillAssessment.create({ data: body });
  };

  updateAssessment = async (id: string, body: UpdateAssessmentDTO) => {
    await this.getAssessmentById(id);
    return await this.prisma.skillAssessment.update({
      where: { id },
      data: body,
    });
  };

  deleteAssessment = async (id: string) => {
    await this.getAssessmentById(id);
    return await this.prisma.skillAssessment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  };

  publishAssessment = async (id: string) => {
    const assessment = await this.prisma.skillAssessment.findFirst({
      where: { id, deletedAt: null },
      include: {
        _count: { select: { questions: { where: { deletedAt: null } } } },
      },
    });
    if (!assessment) throw new ApiError("Assessment not found", 404);

    const REQUIRED_QUESTIONS = 25;
    if (assessment._count.questions !== REQUIRED_QUESTIONS) {
      throw new ApiError(
        `Assessment must have exactly ${REQUIRED_QUESTIONS} questions to publish (currently ${assessment._count.questions})`,
        400,
      );
    }

    return await this.prisma.skillAssessment.update({
      where: { id },
      data: { isPublished: true },
    });
  };

  unpublishAssessment = async (id: string) => {
    await this.getAssessmentById(id);
    return await this.prisma.skillAssessment.update({
      where: { id },
      data: { isPublished: false },
    });
  };
}
