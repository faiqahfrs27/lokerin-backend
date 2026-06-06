import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { ForgotPasswordDTO } from "./forgot-password/dto/forgot-password.dto.js";
import { ForgotPasswordController } from "./forgot-password/forgot-password.controller.js";
import { LoginDTO } from "./login/dto/login.dto.js";
import { LoginController } from "./login/login.controller.js";
import { LogoutController } from "./logout/logout.controller.js";
import { UpdateProfileDTO } from "./profile/dto/update-profile.dto.js";
import { ProfileController } from "./profile/profile.controller.js";
import { RegisterDTO } from "./register/dto/register.dto.js";
import { RegisterController } from "./register/register.controller.js";
import { ResendVerificationDTO } from "./resend-verification/dto/resend-verification.dto.js";
import { ResendVerificationController } from "./resend-verification/resend-verification.controller.js";
import { ResetPasswordDTO } from "./reset-password/dto/reset-password.dto.js";
import { ResetPasswordController } from "./reset-password/reset-password.controller.js";
import { VerifyEmailDTO } from "./verify-email/dto/verify-email.dto.js";
import { VerifyEmailController } from "./verify-email/verify-email.controller.js";
import { GoogleController } from "./google/google.controller.js";
import { GoogleDTO } from "./google/dto/google.dto.js";

export class AuthRouter {
  router: Router;

  constructor(
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware,
    private registerController: RegisterController,
    private verifyEmailController: VerifyEmailController,
    private resendVerificationController: ResendVerificationController,
    private loginController: LoginController,
    private forgotPasswordController: ForgotPasswordController,
    private resetPasswordController: ResetPasswordController,
    private googleController: GoogleController,
    private logoutController: LogoutController,
    private profileController: ProfileController,
  ) {
    this.router = Router();
    this.initRoutes();
  }
  private initRoutes = () => {
    this.router.post(
      "/register",
      this.validationMiddleware.validateBody(RegisterDTO),
      this.registerController.register,
    );

    this.router.get(
      "/verify-email",
      this.validationMiddleware.validateQuery(VerifyEmailDTO),
      this.verifyEmailController.verifyEmail,
    );

    this.router.post(
      "/resend-verification",
      this.validationMiddleware.validateBody(ResendVerificationDTO),
      this.resendVerificationController.resendVerification,
    );

    this.router.post(
      "/login",
      this.validationMiddleware.validateBody(LoginDTO),
      this.loginController.login,
    );

    this.router.post(
      "/forgot-password",
      this.validationMiddleware.validateBody(ForgotPasswordDTO),
      this.forgotPasswordController.forgotPassword,
    );

    this.router.post(
      "/reset-password/:token",
      this.validationMiddleware.validateBody(ResetPasswordDTO),
      this.resetPasswordController.resetPassword,
    );

    this.router.post(
      "/google",
      this.validationMiddleware.validateBody(GoogleDTO),
      this.googleController.google,
    );

    this.router.post("/logout", this.logoutController.logout);

    this.router.get(
      "/profile",
      this.authMiddleware.verifyToken(),
      this.profileController.getProfile,
    );

    this.router.patch(
      "/profile",
      this.authMiddleware.verifyToken(),
      this.validationMiddleware.validateBody(UpdateProfileDTO),
      this.profileController.updateProfile,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
