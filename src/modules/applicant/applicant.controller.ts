import { Request, Response } from "express";
import { ApiError } from "../../utils/api-error.js";
import { ApplicantService } from "./applicant.service.js";
import { QueryApplicantDTO } from "./dto/query-applicant.dto.js";

export class ApplicantController {
  constructor(private applicantService: ApplicantService) {}

  private getCompanyId = (res: Response): string => {
    const companyId = res.locals.user?.companyId;
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }
    return companyId;
  };

  getApplicants = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const query = req.query as unknown as QueryApplicantDTO;
    const result = await this.applicantService.getApplicants(companyId, query);
    res.status(200).send(result);
  };

  getApplicantById = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.applicantService.getApplicantById(id, companyId);
    res.status(200).send(result);
  };

  updateStatus = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.applicantService.updateStatus(
      id,
      companyId,
      req.body,
    );
    res.status(200).send(result);
  };
}
