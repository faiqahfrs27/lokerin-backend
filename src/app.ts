import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import "reflect-metadata";
import { corsOptions } from "./config/cors.js";
import { loggerHttp } from "./lib/logger-http.js";
import { prisma } from "./lib/prisma.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware.js";
import { ValidationMiddleware } from "./middlewares/validation.middleware.js";
import { AssessmentController } from "./modules/assessment/assessment.controller.js";
import { AssessmentRouter } from "./modules/assessment/assessment.router.js";
import { AssessmentService } from "./modules/assessment/assessment.service.js";
import { AssessmentQuestionService } from "./modules/assessment-question/assessment-question.service.js";
import { AssessmentQuestionController } from "./modules/assessment-question/assessment-question.controller.js";
import { AssessmentQuestionRouter } from "./modules/assessment-question/assessment-question.router.js";
import { AssessmentResultController } from "./modules/assessment-result/assessment-result.controller.js";
import { AssessmentResultRouter } from "./modules/assessment-result/assessment-result.router.js";
import { AssessmentResultService } from "./modules/assessment-result/assessment-result.service.js";
import { BadgeService } from "./modules/badge/badge.service.js";
import { BadgeController } from "./modules/badge/badge.controller.js";
import { BadgeRouter } from "./modules/badge/badge.router.js";
import { CertificateService } from "./modules/certificate/certificate.service.js";
import { CertificateController } from "./modules/certificate/certificate.controller.js";
import { CertificateRouter } from "./modules/certificate/certificate.router.js";
import { AuthRouter } from "./modules/auth/auth.router.js";
import { ForgotPasswordController } from "./modules/auth/forgot-password/forgot-password.controller.js";
import { ForgotPasswordService } from "./modules/auth/forgot-password/forgot-password.service.js";
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
import { JobController } from "./modules/job/job.controller.js";
import { JobRouter } from "./modules/job/job.router.js";
import { JobCategoryController } from "./modules/job-category/job-category.controller.js";
import { JobCategoryRouter } from "./modules/job-category/job-category.router.js";
import { JobCategoryService } from "./modules/job-category/job-category.service.js";
import { ApplicantService } from "./modules/applicant/applicant.service.js";
import { ApplicantController } from "./modules/applicant/applicant.controller.js";
import { ApplicantRouter } from "./modules/applicant/applicant.router.js";
import { ApplicationService } from "./modules/application/application.service.js";
import { ApplicationController } from "./modules/application/application.controller.js";
import { ApplicationRouter } from "./modules/application/application.router.js";
import { JobService } from "./modules/job/job.service.js";
import { PreSelectionTestService } from "./modules/pre-selection-test/pre-selection-test.service.js";
import { PreSelectionTestController } from "./modules/pre-selection-test/pre-selection-test.controller.js";
import { PreSelectionTestRouter } from "./modules/pre-selection-test/pre-selection-test.router.js";
import { InterviewService } from "./modules/interview/interview.service.js";
import { InterviewController } from "./modules/interview/interview.controller.js";
import { InterviewRouter } from "./modules/interview/interview.router.js";
import { MailService } from "./modules/mail/mail.service.js";
import { SampleController } from "./modules/sample/sample.controller.js";
import { SampleRouter } from "./modules/sample/sample.router.js";
import { SampleService } from "./modules/sample/sample.service.js";
import { SubscriptionPlanController } from "./modules/subscriptions/subscription-plan.controller.js";
import { SubscriptionPlanRouter } from "./modules/subscriptions/subscription-plan.router.js";
import { SubscriptionPlanService } from "./modules/subscriptions/subscription-plan.service.js";
import { ResetPasswordService } from "./modules/auth/reset-password/reset-password.service.js";
import { ResetPasswordController } from "./modules/auth/reset-password/reset-password.controller.js";
import { ProfileService } from "./modules/profile/profile.service.js";
import { ProfileController } from "./modules/profile/profile.controller.js";
import { GoogleService } from "./modules/auth/google/google.service.js";
import { GoogleController } from "./modules/auth/google/google.controller.js";
import { CloudinaryService } from "./modules/cloudinary/cloudinary.service.js";
import { ProfileRouter } from "./modules/profile/profile.router.js";
import { UploadMiddleware } from "./middlewares/upload.middleware.js";
import { CompanyService } from "./modules/company/company.service.js";
import { CompanyController } from "./modules/company/company.controller.js";
import { CompanyRouter } from "./modules/company/company.router.js";

export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.configure();
  }

  private configure() {
    this.app.use(cors(corsOptions));
    this.app.use(loggerHttp);
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.registerModules();
    this.errorMiddleware();
  }

  private registerModules() {
    // services
    const sampleService = new SampleService(prisma);
    const subscriptionPlanService = new SubscriptionPlanService(prisma);

    //cloudinaryService
    const cloudinaryService = new CloudinaryService();

    //authService
    const mailService = new MailService();
    const registerService = new RegisterService(prisma, mailService);
    const verifyEmailService = new VerifyEmailService(prisma);
    const resendVerificationService = new ResendVerificationService(
      prisma,
      mailService,
    );
    const loginService = new LoginService(prisma);
    const forgotPasswordService = new ForgotPasswordService(
      prisma,
      mailService,
    );
    const resetPasswordService = new ResetPasswordService(prisma);
    const googleService = new GoogleService(prisma);
    const logoutService = new LogoutService(prisma);

    //profileService
    const profileService = new ProfileService(
      prisma,
      cloudinaryService,
      mailService,
    );

    //companyService
    const companyService = new CompanyService(prisma, cloudinaryService);

    //jobService
    const jobService = new JobService(prisma);

    //jobCategoryService
    const jobCategoryService = new JobCategoryService(prisma);

    //preSelectionTestService
    const preSelectionTestService = new PreSelectionTestService(prisma);

    //InterviewService
    const interviewService = new InterviewService(prisma);

    //assessmentService
    const assessmentService = new AssessmentService(prisma);
    const assessmentQuestionService = new AssessmentQuestionService(prisma);

    //assessmentResultService
    const assessmentResultService = new AssessmentResultService(prisma);

    //badgeService
    const badgeService = new BadgeService(prisma);

    //certificateService
    const certificateService = new CertificateService(prisma);

    //applicantService
    const applicantService = new ApplicantService(prisma);

    //applicationService
    const applicationService = new ApplicationService(prisma);

    // controllers
    const sampleController = new SampleController(sampleService);
    const subscriptionPlanController = new SubscriptionPlanController(
      subscriptionPlanService,
    );

    //authController
    const registerController = new RegisterController(registerService);
    const verifyEmailController = new VerifyEmailController(verifyEmailService);
    const resendVerificationController = new ResendVerificationController(
      resendVerificationService,
    );
    const loginCotroller = new LoginController(loginService);
    const forgotPasswordController = new ForgotPasswordController(
      forgotPasswordService,
    );
    const resetPasswordController = new ResetPasswordController(
      resetPasswordService,
    );
    const googleController = new GoogleController(googleService);
    const logoutController = new LogoutController(logoutService);

    //profileController
    const profileController = new ProfileController(profileService);

    //companyController
    const companyController = new CompanyController(companyService);

    //jobController
    const jobController = new JobController(jobService);

    //jobCategoryController
    const jobCategoryController = new JobCategoryController(jobCategoryService);

    //preSelectionTestController
    const preSelectionTestController = new PreSelectionTestController(
      preSelectionTestService,
    );

    //interviewController
    const interviewController = new InterviewController(interviewService);

    //assessmentController
    const assessmentController = new AssessmentController(assessmentService);

    //assessmentQuestionController
    const assessmentQuestionController = new AssessmentQuestionController(
      assessmentQuestionService,
    );

    //assessmentResultController
    const assessmentResultController = new AssessmentResultController(
      assessmentResultService,
    );

    //badgeController
    const badgeController = new BadgeController(badgeService);

    //certificateController
    const certificateController = new CertificateController(certificateService);

    //applicantController
    const applicantController = new ApplicantController(applicantService);

    //applicationController
    const applicationController = new ApplicationController(applicationService);

    // middlewares
    const validationMiddleware = new ValidationMiddleware();
    const authMiddleware = new AuthMiddleware();
    const uploadMiddleware = new UploadMiddleware();

    // routes
    const router = new SampleRouter(sampleController, validationMiddleware);
    const subscriptionPlanRouter = new SubscriptionPlanRouter(
      subscriptionPlanController,
      validationMiddleware,
    );

    const authRouter = new AuthRouter(
      validationMiddleware,
      authMiddleware,
      registerController,
      verifyEmailController,
      resendVerificationController,
      loginCotroller,
      forgotPasswordController,
      resetPasswordController,
      googleController,
      logoutController,
    );

    const profileRouter = new ProfileRouter(
      profileController,
      validationMiddleware,
      authMiddleware,
      uploadMiddleware,
    );

    const companyRouter = new CompanyRouter(
      companyController,
      validationMiddleware,
      authMiddleware,
      uploadMiddleware,
    );

    const jobRouter = new JobRouter(
      jobController,
      validationMiddleware,
      authMiddleware,
    );

    const jobCategoryRouter = new JobCategoryRouter(
      jobCategoryController,
      authMiddleware,
    );

    const assessmentRouter = new AssessmentRouter(
      assessmentController,
      validationMiddleware,
      authMiddleware,
    );

    const assessmentQuestionRouter = new AssessmentQuestionRouter(
      assessmentQuestionController,
      validationMiddleware,
      authMiddleware,
    );

    const assessmentResultRouter = new AssessmentResultRouter(
      assessmentResultController,
      validationMiddleware,
      authMiddleware,
    );

    const badgeRouter = new BadgeRouter(badgeController, authMiddleware);

    const certificateRouter = new CertificateRouter(
      certificateController,
      authMiddleware,
    );

    const applicantRouter = new ApplicantRouter(
      applicantController,
      validationMiddleware,
      authMiddleware,
    );

    const applicationRouter = new ApplicationRouter(
      applicationController,
      validationMiddleware,
      authMiddleware,
    );

    const preSelectionTestRouter = new PreSelectionTestRouter(
      preSelectionTestController,
      validationMiddleware,
      authMiddleware,
    );

    const interviewRouter = new InterviewRouter(
      interviewController,
      validationMiddleware,
      authMiddleware,
    );

    // entry point
    this.app.use("/samples", router.getRouter());
    this.app.use("/api/subscription-plans", subscriptionPlanRouter.getRouter());
    this.app.use("/api/auth", authRouter.getRouter());
    this.app.use("/api/auth/profile", profileRouter.getRouter());
    this.app.use("/api/companies", companyRouter.getRouter());
    this.app.use("/api/jobs", jobRouter.getRouter());
    this.app.use("/api/job-categories", jobCategoryRouter.getRouter());
    this.app.use("/api/assessments", assessmentRouter.getRouter());
    this.app.use("/api/assessments", assessmentQuestionRouter.getRouter());
    this.app.use("/api/assessment-results", assessmentResultRouter.getRouter());
    this.app.use("/api/badges", badgeRouter.getRouter());
    this.app.use("/api/certificates", certificateRouter.getRouter());
    this.app.use("/api/applicants", applicantRouter.getRouter());
    this.app.use("/api/applications", applicationRouter.getRouter());
    this.app.use("/api/tests", preSelectionTestRouter.getRouter());
    this.app.use("/api/interviews", interviewRouter.getRouter());
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
