import { Router } from "express";
import { RegisterController } from "./register/register.controller.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { RegisterDTO } from "./register/dto/register.dto.js";
import { VerifyEmailController } from "./verify-email/verify-email.controller.js";
import { ResendVerificationDTO } from "./resend-verification/dto/resend-verification.dto.js";
import { ResendVerificationController } from "./resend-verification/resend-verification.controller.js";
import { VerifyEmailDTO } from "./verify-email/dto/verify-email.dto.js";
import { LoginController } from "./login/login.controller.js";
import { LoginDTO } from "./login/dto/login.dto.js";
import { LogoutController } from "./logout/logout.controller.js";
import { ForgotPasswordDTO } from "./forgot-password/dto/forgot-password.dto.js";
import { ForgotPasswordController } from "./forgot-password/forgot-password.controller.js";

export class AuthRouter {
  router: Router;

  constructor(
    private registerController: RegisterController,
    private validationMiddleware: ValidationMiddleware,
    private verifyEmailController: VerifyEmailController,
    private resendVerificationController: ResendVerificationController,
    private loginController: LoginController,
    private forgotPasswordController: ForgotPasswordController,
    private logoutController: LogoutController,
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

    this.router.post("/logout", this.logoutController.logout);
  };

  getRouter = () => {
    return this.router;
  };
}
