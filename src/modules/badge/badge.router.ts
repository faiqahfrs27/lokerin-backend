import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { BadgeController } from "./badge.controller.js";

export class BadgeRouter {
  private router: Router;

  constructor(
    private badgeController: BadgeController,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    const auth = this.authMiddleware.verifyToken();

    this.router.get("/me", auth, this.badgeController.getMyBadges);
  };

  getRouter = () => {
    return this.router;
  };
}
