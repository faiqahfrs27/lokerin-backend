import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { CloudinaryController } from "./cloudinary.controller.js";

export class CloudinaryRouter {
  private router: Router;

  constructor(
    private controller: CloudinaryController,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.post(
      "/sign",
      this.authMiddleware.verifyToken(),
      this.controller.getUploadSignature,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
