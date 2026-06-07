import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AssessmentQuestionController } from "./assessment-question.controller.js";
import { CreateQuestionDTO } from "./dto/create-question.dto.js";
import { UpdateQuestionDTO } from "./dto/update-question.dto.js";
import { Role } from "../../../generated/prisma/enums.js";

export class AssessmentQuestionRouter {
  private router: Router;

  constructor(
    private assessmentQuestionController: AssessmentQuestionController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    const auth = this.authMiddleware.verifyToken();
    const devOnly = this.authMiddleware.verifyRole([Role.dev]);

    this.router.post(
      "/:id/questions",
      auth,
      devOnly,
      this.validationMiddleware.validateBody(CreateQuestionDTO),
      this.assessmentQuestionController.addQuestion,
    );

    this.router.patch(
      "/:id/questions/:questionId",
      auth,
      devOnly,
      this.validationMiddleware.validateBody(UpdateQuestionDTO),
      this.assessmentQuestionController.updateQuestion,
    );

    this.router.delete(
      "/:id/questions/:questionId",
      auth,
      devOnly,
      this.assessmentQuestionController.deleteQuestion,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
