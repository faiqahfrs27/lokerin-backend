import { NextFunction, Request, Response } from "express";
import { CompanyService } from "./company.service.js";

export class CompanyController {
  constructor(private companyService: CompanyService) {}

  // ─── PUBLIC ───────────────────────────────────────────────

  getPublicCompanies = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { search, city, sortBy, sortOrder, page, limit } = req.query;
      const result = await this.companyService.getPublicCompanies({
        search: typeof search === "string" ? search : undefined,
        city: typeof city === "string" ? city : undefined,
        sortBy: typeof sortBy === "string" ? sortBy : undefined,
        sortOrder: typeof sortOrder === "string" ? sortOrder : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getPublicCompanyById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.params;
      const result = await this.companyService.getPublicCompanyById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // ─── ADMIN ────────────────────────────────────────────────

  getCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = res.locals.user.companyId;
      const result = await this.companyService.getCompany(companyId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateCompany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = res.locals.user.companyId;
      const result = await this.companyService.updateCompany(
        companyId,
        req.body,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  updateLogo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = res.locals.user.companyId;
      const file = req.file;
      if (!file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }
      const result = await this.companyService.updateLogo(companyId, file);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
