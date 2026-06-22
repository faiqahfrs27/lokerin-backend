import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { CvController } from "./cv.controller.js";
import { SaveCvDTO } from "./dto/save-cv.dto.js";

export class CvRouter {
  private router: Router;

  constructor(
    private cvController: CvController,
    private authMiddleware: AuthMiddleware,
    private validationMiddleware: ValidationMiddleware,
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    const auth = this.authMiddleware.verifyToken();

    this.router.get("/", auth, this.cvController.getCv);

    this.router.post(
      "/",
      auth,
      this.validationMiddleware.validateBody(SaveCvDTO),
      this.cvController.saveCv,
    );

    this.router.get("/download", auth, this.cvController.downloadCv);
  };

  getRouter = () => this.router;
}
