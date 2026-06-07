import { Request, Response } from "express";
import { JobService } from "./job.service.js";
import { QueryJobDTO } from "./dto/query-job.dto.js";

export class JobController {
  constructor(private jobService: JobService) {}

  private getCompanyId = (res: Response): string | undefined => {
    return res.locals.user?.companyId;
  };

  createJob = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const result = await this.jobService.createJob(companyId, req.body);
    res.status(201).send(result);
  };

  getJobs = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const query = req.query as unknown as QueryJobDTO;
    const result = await this.jobService.getJobs(companyId, query);
    res.status(200).send(result);
  };

  getJobById = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.jobService.getJobById(id, companyId);
    res.status(200).send(result);
  };

  updateJob = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.jobService.updateJob(id, companyId, req.body);
    res.status(200).send(result);
  };

  togglePublish = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.jobService.togglePublish(id, companyId);
    res.status(200).send(result);
  };

  deleteJob = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.jobService.deleteJob(id, companyId);
    res.status(200).send(result);
  };
}
