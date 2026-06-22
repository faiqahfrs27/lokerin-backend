import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { CertificateController } from "./certificate.controller.js";

export class CertificateRouter {
  private router: Router;

  constructor(
    private certificateController: CertificateController,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    const auth = this.authMiddleware.verifyToken();

    this.router.get("/verify/:code", this.certificateController.verifyByCode);

    this.router.get("/me", auth, this.certificateController.getMyCertificates);

    this.router.get(
      "/:id/download",
      auth,
      this.certificateController.downloadCertificate,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
