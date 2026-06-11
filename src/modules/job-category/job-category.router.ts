import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { CreateJobCategoryDTO } from "./dto/create-job-category.dto.js";
import { JobCategoryController } from "./job-category.controller.js";

export class JobCategoryRouter {
  private router: Router;

  constructor(
    private jobCategoryController: JobCategoryController,
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
      this.authMiddleware.verifyRole([Role.admin, Role.user]),
      this.jobCategoryController.getAll,
    );

    this.router.post(
      "/",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateBody(CreateJobCategoryDTO),
      this.jobCategoryController.create,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
