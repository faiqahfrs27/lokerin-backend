import { Request, Response } from "express";
import { AssessmentResultService } from "./assessment-result.service.js";

export class AssessmentResultController {
  constructor(private assessmentResultService: AssessmentResultService) {}

  startAttempt = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.assessmentResultService.startAttempt(
      userId,
      req.params.assessmentId as string,
    );
    res.status(201).send(result);
  };

  submitAnswers = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.assessmentResultService.submitAnswers(
      userId,
      req.params.id as string,
      req.body.answers,
    );
    res.status(200).send(result);
  };

  getMyResults = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.assessmentResultService.getMyResults(userId);
    res.status(200).send(result);
  };

  getUsage = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.assessmentResultService.getUsage(userId);
    res.status(200).send(result);
  };

  getResultById = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.assessmentResultService.getResultById(
      userId,
      req.params.id as string,
    );
    res.status(200).send(result);
  };
}
