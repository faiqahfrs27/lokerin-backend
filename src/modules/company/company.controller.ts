import { Request, Response } from "express";
import { CompanyService } from "./company.service.js";

export class CompanyController {
  constructor(private companyService: CompanyService) {}

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
