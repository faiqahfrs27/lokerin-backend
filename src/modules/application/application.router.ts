import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { UploadMiddleware } from "../../middlewares/upload.middleware.js"; // sesuaikan path
import { CreateApplicationDTO } from "./dto/create-application.dto.js";
import { QueryApplicationDTO } from "./dto/query-application.dto.js";
import { ApplicationController } from "./application.controller.js";

export class ApplicationRouter {
  private router: Router;

  constructor(
    private controller: ApplicationController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware,
    private uploadMiddleware: UploadMiddleware, // sesuaikan dengan setup multer di project
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post(
      "/",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.user]),
      this.authMiddleware.verifyEmailVerified(),
      this.uploadMiddleware.singlePdf("cv"),
      this.validationMiddleware.validateBody(CreateApplicationDTO),
      this.controller.createApplication,
    );

    this.router.get(
      "/",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.user]),
      this.validationMiddleware.validateQuery(QueryApplicationDTO),
      this.controller.getMyApplications,
    );

    this.router.get(
      "/:id",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.user]),
      this.controller.getApplicationById,
    );

    this.router.get(
      "/:id/cv",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.user, Role.admin, Role.dev]),
      this.controller.getCvSignedUrl,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
