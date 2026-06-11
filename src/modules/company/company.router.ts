import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { UploadMiddleware } from "../../middlewares/upload.middleware.js";
import { CompanyController } from "./company.controller.js";
import { UpdateCompanyDTO } from "./dto/update-company.dto.js";

export class CompanyRouter {
  private router: Router;

  constructor(
    private companyController: CompanyController,
    private validationMiddleware: ValidationMiddleware,
    private authMiddleware: AuthMiddleware,
    private uploadMiddleware: UploadMiddleware,
  ) {
    this.router = Router();
    this.initRoutes();
  }

  private initRoutes = () => {
    // ─── PUBLIC ───────────────────────────────────────────────

    // GET /api/companies
    this.router.get("/", this.companyController.getPublicCompanies);

    // GET /api/companies/:id
    this.router.get("/:id", this.companyController.getPublicCompanyById);

    // ─── ADMIN ────────────────────────────────────────────────

    // GET /api/companies/me
    this.router.get(
      "/me",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.companyController.getCompany,
    );

    // PATCH /api/companies/me
    this.router.patch(
      "/me",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.validationMiddleware.validateBody(UpdateCompanyDTO),
      this.companyController.updateCompany,
    );

    // PATCH /api/companies/me/logo
    this.router.patch(
      "/me/logo",
      this.authMiddleware.verifyToken(),
      this.authMiddleware.verifyRole([Role.admin]),
      this.uploadMiddleware.upload(2).single("logo"),
      this.companyController.updateLogo,
    );
  };

  getRouter = () => this.router;
}
