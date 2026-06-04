import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { ApplicantController } from "./applicant.controller.js";
import { QueryApplicantDTO } from "./dto/query-applicant.dto.js";
import { UpdateApplicantStatusDTO } from "./dto/update-applicant-status.dto.js";

export class ApplicantRouter {
  private router: Router;

  constructor(
    private applicantController: ApplicantController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get(
      "/",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateQuery(QueryApplicantDTO),
      this.applicantController.getApplicants,
    );

    this.router.get(
      "/:id",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.applicantController.getApplicantById,
    );

    this.router.patch(
      "/:id/status",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateBody(UpdateApplicantStatusDTO),
      this.applicantController.updateStatus,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
