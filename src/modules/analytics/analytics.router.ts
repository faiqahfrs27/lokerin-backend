import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { AnalyticsController } from "./analytics.controller.js";

export class AnalyticsRouter {
  private router: Router;

  constructor(
    private analyticsController: AnalyticsController,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get(
      "/overview",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.analyticsController.getOverview,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
