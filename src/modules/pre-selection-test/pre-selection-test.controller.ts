import { Request, Response } from "express";
import { PreSelectionTestService } from "./pre-selection-test.service.js";
import { QueryTestDTO } from "./dto/query-test.dto.js";

export class PreSelectionTestController {
  constructor(private testService: PreSelectionTestService) {}

  private getCompanyId = (res: Response): string | undefined => {
    return res.locals.user?.companyId;
  };

  private getUserId = (res: Response): string | undefined => {
    return res.locals.user?.id;
  };

  createTest = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const result = await this.testService.createTest(companyId, req.body);
    res.status(201).send(result);
  };

  getTests = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const query = req.query as unknown as QueryTestDTO;
    const result = await this.testService.getTests(companyId, query);
    res.status(200).send(result);
  };

  getTestById = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.testService.getTestById(id, companyId);
    res.status(200).send(result);
  };

  getTestForJob = async (req: Request, res: Response) => {
    const jobId = req.params.jobId as string;
    const userId = res.locals.user?.id as string | undefined;
    const result = await this.testService.getTestForJob(jobId, userId);
    res.status(200).send(result);
  };

  updateTest = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.testService.updateTest(id, companyId, req.body);
    res.status(200).send(result);
  };

  deleteTest = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.testService.deleteTest(id, companyId);
    res.status(200).send(result);
  };

  addQuestion = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const id = req.params.id as string;
    const result = await this.testService.addQuestion(id, companyId, req.body);
    res.status(201).send(result);
  };

  updateQuestion = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const questionId = req.params.questionId as string;
    const result = await this.testService.updateQuestion(
      questionId,
      companyId,
      req.body,
    );
    res.status(200).send(result);
  };

  deleteQuestion = async (req: Request, res: Response) => {
    const companyId = this.getCompanyId(res);
    const questionId = req.params.questionId as string;
    const result = await this.testService.deleteQuestion(questionId, companyId);
    res.status(200).send(result);
  };

  submitAttempt = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const id = req.params.id as string;
    const result = await this.testService.submitAttempt(id, userId, req.body);
    res.status(201).send(result);
  };
}
