import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { CreateJobDTO } from "./dto/create-job.dto.js";
import { QueryJobDTO } from "./dto/query-job.dto.js";
import { UpdateJobDTO } from "./dto/update-job.dto.js";
import { JobController } from "./job.controller.js";

export class JobRouter {
  private router: Router;

  constructor(
    private jobController: JobController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    this.router.get(
      "/public",
      this.validationMiddleware.validateQuery(QueryJobDTO),
      this.jobController.getPublicJobs,
    );

    this.router.get("/public/:id", this.jobController.getPublicJobById);

    this.router.get(
      "/",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateQuery(QueryJobDTO),
      this.jobController.getJobs,
    );

    this.router.post(
      "/",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateBody(CreateJobDTO),
      this.jobController.createJob,
    );

    this.router.get(
      "/:id",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.jobController.getJobById,
    );

    this.router.patch(
      "/:id",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateBody(UpdateJobDTO),
      this.jobController.updateJob,
    );

    this.router.patch(
      "/:id/publish",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.jobController.togglePublish,
    );

    this.router.delete(
      "/:id",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.jobController.deleteJob,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
