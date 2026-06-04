import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { AssessmentResultController } from "./assessment-result.controller.js";
import { SubmitAnswersDTO } from "./dto/submit-answers.dto.js";

export class AssessmentResultRouter {
  private router: Router;

  constructor(
    private assessmentResultController: AssessmentResultController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    const auth = this.authMiddleware.verifyToken(process.env.JWT_SECRET!);

    // GET /me
    this.router.get("/me", auth, this.assessmentResultController.getMyResults);

    // POST /start/:assessmentId
    this.router.post(
      "/start/:assessmentId",
      auth,
      this.assessmentResultController.startAttempt,
    );

    // POST /:id/submit
    this.router.post(
      "/:id/submit",
      auth,
      this.validationMiddleware.validateBody(SubmitAnswersDTO),
      this.assessmentResultController.submitAnswers,
    );

    // GET /:id
    this.router.get(
      "/:id",
      auth,
      this.assessmentResultController.getResultById,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
