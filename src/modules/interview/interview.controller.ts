import { Request, Response } from "express";
import { QueryInterviewDTO } from "./dto/query-interview.dto.js";
import { InterviewService } from "./interview.service.js";

export class InterviewController {
  constructor(private interviewService: InterviewService) {}

  private getCompanyId = (res: Response): string | undefined => {
    return res.locals.user?.companyId;
  };

  createInterview = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const result = await this.interviewService.createInterview(
      companyId,
      req.body,
    );
    res.status(201).send(result);
  };

  getInterviews = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const query = req.query as unknown as QueryInterviewDTO;
    const result = await this.interviewService.getInterviews(companyId, query);
    res.status(200).send(result);
  };

  getInterviewById = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.interviewService.getInterviewById(id, companyId);
    res.status(200).send(result);
  };

  updateInterview = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.interviewService.updateInterview(
      id,
      companyId,
      req.body,
    );
    res.status(200).send(result);
  };

  deleteInterview = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.interviewService.deleteInterview(id, companyId);
    res.status(200).send(result);
  };

  getMyInterviews = async (req: Request, res: Response) => {
    const userId = res.locals.user?.id;
    const result = await this.interviewService.getInterviewsByUser(userId);
    res.status(200).send(result);
  };
}
