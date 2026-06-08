import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { UploadMiddleware } from "../../middlewares/upload.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { UpdateEmailDTO } from "./dto/update-email.dto.js";
import { UpdatePasswordDTO } from "./dto/update-password.dto.js";
import { UpdateProfileDTO } from "./dto/update-profile.dto.js";
import { ProfileController } from "./profile.controller.js";

export class ProfileRouter {
  private router: Router;

  constructor(
    private profileController: ProfileController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware,
    private uploadMiddleware: UploadMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get(
      "/",
      this.authMiddleware.verifyToken(),
      this.profileController.getProfile,
    );

    this.router.patch(
      "/",
      this.authMiddleware.verifyToken(),
      this.validationMiddleware.validateBody(UpdateProfileDTO),
      this.profileController.updateProfile,
    );

    this.router.patch(
      "/photo",
      this.authMiddleware.verifyToken(),
      this.uploadMiddleware.upload(1).single("photo"),
      this.profileController.updateProfilePhoto,
    );

    this.router.patch(
      "/password",
      this.authMiddleware.verifyToken(),
      this.validationMiddleware.validateBody(UpdatePasswordDTO),
      this.profileController.updatePassword,
    );

    this.router.patch(
      "/email",
      this.authMiddleware.verifyToken(),
      this.validationMiddleware.validateBody(UpdateEmailDTO),
      this.profileController.updateEmail,
    );
  };

  getRouter = () => this.router;
}
