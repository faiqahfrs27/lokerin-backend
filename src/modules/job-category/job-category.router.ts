import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { JobCategoryController } from "./job-category.controller.js";

export class JobCategoryRouter {
  private router: Router;

  constructor(
    private jobCategoryController: JobCategoryController,
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
  };

  getRouter = () => {
    return this.router;
  };
}
