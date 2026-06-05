import { Request, Response } from "express";
import { ApplicantService } from "./applicant.service.js";
import { QueryApplicantDTO } from "./dto/query-applicant.dto.js";

export class ApplicantController {
  constructor(private applicantService: ApplicantService) {}

  private getUserId = (res: Response): string => {
    return res.locals.user?.id;
  };

  getApplicants = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const query = req.query as unknown as QueryApplicantDTO;
    const result = await this.applicantService.getApplicants(userId, query);
    res.status(200).send(result);
  };

  getApplicantById = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const id = req.params.id as string;
    const result = await this.applicantService.getApplicantById(id, userId);
    res.status(200).send(result);
  };

  updateStatus = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const id = req.params.id as string;
    const result = await this.applicantService.updateStatus(
      id,
      userId,
      req.body,
    );
    res.status(200).send(result);
  };
}
