import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AssessmentController } from "./assessment.controller.js";
import { CreateAssessmentDTO } from "./dto/create-assessment.dto.js";
import { CreateQuestionDTO } from "./dto/create-question.dto.js";
import { UpdateAssessmentDTO } from "./dto/update-assessment.dto.js";
import { Role } from "../../../generated/prisma/enums.js";
import { UpdateQuestionDTO } from "./dto/update-question.dto.js";

export class AssessmentRouter {
  private router: Router;

  constructor(
    private assessmentController: AssessmentController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    const auth = this.authMiddleware.verifyToken(process.env.JWT_SECRET!);
    const devOnly = this.authMiddleware.verifyRole([Role.dev]);

    this.router.get(
      "/",
      auth,
      devOnly,
      this.assessmentController.getAssessments,
    );
    this.router.get(
      "/:id",
      auth,
      devOnly,
      this.assessmentController.getAssessmentById,
    );

    this.router.post(
      "/",
      auth,
      devOnly,
      this.validationMiddleware.validateBody(CreateAssessmentDTO),
      this.assessmentController.createAssessment,
    );

    this.router.patch(
      "/:id",
      auth,
      devOnly,
      this.validationMiddleware.validateBody(UpdateAssessmentDTO),
      this.assessmentController.updateAssessment,
    );

    this.router.delete(
      "/:id",
      auth,
      devOnly,
      this.assessmentController.deleteAssessment,
    );

    this.router.post(
      "/:id/questions",
      auth,
      devOnly,
      this.validationMiddleware.validateBody(CreateQuestionDTO),
      this.assessmentController.addQuestion,
    );

    this.router.patch(
      "/:id/questions/:questionId",
      auth,
      devOnly,
      this.validationMiddleware.validateBody(UpdateQuestionDTO),
      this.assessmentController.updateQuestion,
    );

    this.router.delete(
      "/:id/questions/:questionId",
      auth,
      devOnly,
      this.assessmentController.deleteQuestion,
    );

    this.router.patch(
      "/:id/publish",
      auth,
      devOnly,
      this.assessmentController.publishAssessment,
    );
    this.router.patch(
      "/:id/unpublish",
      auth,
      devOnly,
      this.assessmentController.unpublishAssessment,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
