import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { CreateJobDTO } from "./dto/create-job.dto.js";
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
    this.router.post(
      "/",
      this.authMiddleware.verifyToken,
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateBody(CreateJobDTO),
      this.jobController.createJob,
    );

    this.router.get("/:id", this.jobController.getJobById);

    this.router.patch(
      "/:id",
      this.validationMiddleware.validateBody(UpdateJobDTO),
      this.jobController.updateJob,
    );

    this.router.delete("/:id", this.jobController.deleteJob);
  };

  getRouter = () => this.router;
}