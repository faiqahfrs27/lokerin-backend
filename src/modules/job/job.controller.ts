import { Request, Response } from "express";
import { ApiError } from "../../utils/api-error.js";
import { JobService } from "./job.service.js";

export class JobController {
  constructor(private jobService: JobService) {}

  // Ambil companyId dari JWT payload (di-set sama auth middleware)
  private getCompanyId = (res: Response): string => {
    const companyId = res.locals.user?.companyId;
    if (!companyId) {
      throw new ApiError(
        "Your account is not linked to a company",
        403,
      );
    }
    return companyId;
  };

  createJob = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const result = await this.jobService.createJob(companyId, req.body);
    res.status(201).send(result);
  };

  getJobById = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const result = await this.jobService.getJobById(req.params.id, companyId);
    res.status(200).send(result);
  };

  updateJob = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const result = await this.jobService.updateJob(
      req.params.id,
      companyId,
      req.body,
    );
    res.status(200).send(result);
  };

  deleteJob = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const result = await this.jobService.deleteJob(req.params.id, companyId);
    res.status(200).send(result);
  };
}