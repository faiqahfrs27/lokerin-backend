import cors from "cors";
import express, { Express } from "express";
import "reflect-metadata";
import { loggerHttp } from "./lib/logger-http.js";
import { prisma } from "./lib/prisma.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware.js";
import { ValidationMiddleware } from "./middlewares/validation.middleware.js";
import { AuthRouter } from "./modules/auth/auth.router.js";
import { LoginController } from "./modules/auth/login/login.controller.js";
import { LoginService } from "./modules/auth/login/login.service.js";
import { LogoutController } from "./modules/auth/logout/logout.controller.js";
import { LogoutService } from "./modules/auth/logout/logout.service.js";
import { RegisterController } from "./modules/auth/register/register.controller.js";
import { RegisterService } from "./modules/auth/register/register.service.js";
import { ResendVerificationController } from "./modules/auth/resend-verification/resend-verification.controller.js";
import { ResendVerificationService } from "./modules/auth/resend-verification/resend-verification.service.js";
import { VerifyEmailController } from "./modules/auth/verify-email/verify-email.controller.js";
import { VerifyEmailService } from "./modules/auth/verify-email/verify-email.service.js";
import { MailService } from "./modules/mail/mail.service.js";
import { SampleController } from "./modules/sample/sample.controller.js";
import { SampleRouter } from "./modules/sample/sample.router.js";
import { SampleService } from "./modules/sample/sample.service.js";

export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.configure();
  }

  private configure() {
    this.app.use(cors());
    this.app.use(loggerHttp);
    this.app.use(express.json());
    this.registerModules();
    this.errorMiddleware();
  }

  private registerModules() {
    // services
    const sampleService = new SampleService(prisma);

    //authService
    const mailService = new MailService();
    const registerService = new RegisterService(prisma, mailService);
    const verifyEmailService = new VerifyEmailService(prisma);
    const resendVerificationService = new ResendVerificationService(
      prisma,
      mailService,
    );
    const loginService = new LoginService(prisma);
    const logoutService = new LogoutService(prisma);

    // controllers
    const sampleController = new SampleController(sampleService);

    //authController
    const registerController = new RegisterController(registerService);
    const verifyEmailController = new VerifyEmailController(verifyEmailService);
    const resendVerificationController = new ResendVerificationController(
      resendVerificationService,
    );
    const loginCotroller = new LoginController(loginService);
    const logoutController = new LogoutController(logoutService);

    // middlewares
    const validationMiddleware = new ValidationMiddleware();

    // routes
    const router = new SampleRouter(sampleController, validationMiddleware);
    const authRouter = new AuthRouter(
      registerController,
      validationMiddleware,
      verifyEmailController,
      resendVerificationController,
      loginCotroller,
      logoutController,
    );

    // entry point
    this.app.use("/samples", router.getRouter());
    this.app.use("/api/auth", authRouter.getRouter());
  }

  private errorMiddleware() {
    this.app.use(errorMiddleware);
    this.app.use(notFoundMiddleware);
  }

  public start() {
    const PORT = Number(process.env.PORT);

    this.app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  }
}
