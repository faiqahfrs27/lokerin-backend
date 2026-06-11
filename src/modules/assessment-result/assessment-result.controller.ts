import { Request, Response } from "express";
import { AssessmentResultService } from "./assessment-result.service.js";

export class AssessmentResultController {
  constructor(private assessmentResultService: AssessmentResultService) {}

  // POST /api/assessment-results/start/:assessmentId
  startAttempt = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.assessmentResultService.startAttempt(
      userId,
      req.params.assessmentId,
    );
    res.status(201).send(result);
  };

  // POST /api/assessment-results/:id/submit
  submitAnswers = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.assessmentResultService.submitAnswers(
      userId,
      req.params.id,
      req.body.answers,
    );
    res.status(200).send(result);
  };

  // GET /api/assessment-results/me
  getMyResults = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.assessmentResultService.getMyResults(userId);
    res.status(200).send(result);
  };

  // GET /api/assessment-results/usage
  getUsage = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.assessmentResultService.getUsage(userId);
    res.status(200).send(result);
  };

  // GET /api/assessment-results/:id
  getResultById = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.assessmentResultService.getResultById(
      userId,
      req.params.id,
    );
    res.status(200).send(result);
  };
}
