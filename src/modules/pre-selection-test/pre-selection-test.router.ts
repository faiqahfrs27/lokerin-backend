import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { CreateTestDTO } from "./dto/create-test.dto.js";
import { UpdateTestDTO } from "./dto/update-test.dto.js";
import { CreateQuestionDTO } from "./dto/create-question.dto.js";
import { UpdateQuestionDTO } from "./dto/update-question.dto.js";
import { QueryTestDTO } from "./dto/query-test.dto.js";
import { PreSelectionTestController } from "./pre-selection-test.controller.js";

export class PreSelectionTestRouter {
  private router: Router;

  constructor(
    private controller: PreSelectionTestController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    // Question routes — declared BEFORE /:id so /questions/:questionId matches first
    this.router.patch(
      "/questions/:questionId",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateBody(UpdateQuestionDTO),
      this.controller.updateQuestion,
    );

    this.router.delete(
      "/questions/:questionId",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.controller.deleteQuestion,
    );

    this.router.post(
      "/:id/questions",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateBody(CreateQuestionDTO),
      this.controller.addQuestion,
    );

    // Test CRUD
    this.router.get(
      "/",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateQuery(QueryTestDTO),
      this.controller.getTests,
    );

    this.router.post(
      "/",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateBody(CreateTestDTO),
      this.controller.createTest,
    );

    this.router.get(
      "/:id",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.controller.getTestById,
    );

    this.router.patch(
      "/:id",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateBody(UpdateTestDTO),
      this.controller.updateTest,
    );

    this.router.delete(
      "/:id",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.controller.deleteTest,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
