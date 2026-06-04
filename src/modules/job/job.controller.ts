import { Request, Response } from "express";
import { JobService } from "./job.service.js";
import { QueryJobDTO } from "./dto/query-job.dto.js";

export class JobController {
  constructor(private jobService: JobService) {}

  private getUserId = (res: Response): string => {
    return res.locals.user?.id;
  };

  createJob = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const result = await this.jobService.createJob(userId, req.body);
    res.status(201).send(result);
  };

  getJobs = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const query = req.query as unknown as QueryJobDTO;
    const result = await this.jobService.getJobs(userId, query);
    res.status(200).send(result);
  };

  getJobById = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const id = req.params.id as string;
    const result = await this.jobService.getJobById(id, userId);
    res.status(200).send(result);
  };

  updateJob = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const id = req.params.id as string;
    const result = await this.jobService.updateJob(id, userId, req.body);
    res.status(200).send(result);
  };

  togglePublish = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const id = req.params.id as string;
    const result = await this.jobService.togglePublish(id, userId);
    res.status(200).send(result);
  };

  deleteJob = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const id = req.params.id as string;
    const result = await this.jobService.deleteJob(id, userId);
    res.status(200).send(result);
  };
}
