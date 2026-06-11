import { Request, Response } from "express";
import { CompanyService } from "./company.service.js";

export class CompanyController {
  constructor(private companyService: CompanyService) {}

  // ─── PUBLIC ───────────────────────────────────────────────

  getPublicCompanies = async (req: Request, res: Response) => {
    const { search, city, sortBy, sortOrder, page, limit } = req.query;
    const result = await this.companyService.getPublicCompanies({
      search: search as string,
      city: city as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).send(result);
  };

  getPublicCompanyById = async (req: Request, res: Response) => {
    const result = await this.companyService.getPublicCompanyById(
      req.params.id,
    );
    res.status(200).send(result);
  };

  // ─── ADMIN ────────────────────────────────────────────────

  getCompany = async (req: Request, res: Response) => {
    const companyId = res.locals.user.companyId;
    const result = await this.companyService.getCompany(companyId);
    res.status(200).send(result);
  };

  updateCompany = async (req: Request, res: Response) => {
    const companyId = res.locals.user.companyId;
    const result = await this.companyService.updateCompany(companyId, req.body);
    res.status(200).send(result);
  };

  updateLogo = async (req: Request, res: Response) => {
    const companyId = res.locals.user.companyId;
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    const result = await this.companyService.updateLogo(companyId, file);
    res.status(200).send(result);
  };
}
