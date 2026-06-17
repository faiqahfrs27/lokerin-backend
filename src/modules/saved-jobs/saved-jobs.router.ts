import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { SavedJobsController } from "./saved-jobs.controller.js";

export class SavedJobsRouter {
  private router: Router;

  constructor(
    private savedJobController: SavedJobsController,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    // GET /api/saved-jobs — list saved jobs user
    this.router.get(
      "/",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.user]),
      this.savedJobController.getSavedJobs,
    );

    // POST /api/saved-jobs — save job
    this.router.post(
      "/",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.user]),
      this.savedJobController.saveJob,
    );

    // DELETE /api/saved-jobs/:jobId — unsave job
    this.router.delete(
      "/:jobId",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.user]),
      this.savedJobController.unsaveJob,
    );
  };

  getRouter = () => this.router;
}
