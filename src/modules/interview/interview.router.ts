import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { CreateInterviewDTO } from "./dto/create-interview.dto.js";
import { QueryInterviewDTO } from "./dto/query-interview.dto.js";
import { UpdateInterviewDTO } from "./dto/update-interview.dto.js";
import { InterviewController } from "./interview.controller.js";

export class InterviewRouter {
  private router: Router;

  constructor(
    private interviewController: InterviewController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post(
      "/",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateBody(CreateInterviewDTO),
      this.interviewController.createInterview,
    );

    this.router.get(
      "/",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateQuery(QueryInterviewDTO),
      this.interviewController.getInterviews,
    );

    this.router.get(
      "/:id",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.interviewController.getInterviewById,
    );

    this.router.patch(
      "/:id",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateBody(UpdateInterviewDTO),
      this.interviewController.updateInterview,
    );

    this.router.delete(
      "/:id",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.interviewController.deleteInterview,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
