import { Request, Response } from "express";
import { AssessmentService } from "./assessment.service.js";
import { QuestionService } from "./question.service.js";

export class AssessmentController {
  constructor(
    private assessmentService: AssessmentService,
    private questionService: QuestionService,
  ) {}

  // ===== USER-FACING =====

  getPublishedAssessments = async (req: Request, res: Response) => {
    const result = await this.assessmentService.getPublishedAssessments();
    res.status(200).send(result);
  };

  // ===== DEV-ONLY =====

  getAssessments = async (req: Request, res: Response) => {
    const result = await this.assessmentService.getAssessments();
    res.status(200).send(result);
  };

  getAssessmentById = async (req: Request, res: Response) => {
    const result = await this.assessmentService.getAssessmentById(
      req.params.id,
    );
    res.status(200).send(result);
  };

  createAssessment = async (req: Request, res: Response) => {
    const result = await this.assessmentService.createAssessment(req.body);
    res.status(201).send(result);
  };

  updateAssessment = async (req: Request, res: Response) => {
    const result = await this.assessmentService.updateAssessment(
      req.params.id,
      req.body,
    );
    res.status(200).send(result);
  };

  deleteAssessment = async (req: Request, res: Response) => {
    await this.assessmentService.deleteAssessment(req.params.id);
    res.status(200).send({ message: "Assessment deleted" });
  };

  addQuestion = async (req: Request, res: Response) => {
    const result = await this.questionService.addQuestion(
      req.params.id,
      req.body,
    );
    res.status(201).send(result);
  };

  updateQuestion = async (req: Request, res: Response) => {
    const result = await this.questionService.updateQuestion(
      req.params.questionId,
      req.body,
    );
    res.status(200).send(result);
  };

  deleteQuestion = async (req: Request, res: Response) => {
    await this.questionService.deleteQuestion(req.params.questionId);
    res.status(200).send({ message: "Question deleted" });
  };

  publishAssessment = async (req: Request, res: Response) => {
    const result = await this.assessmentService.publishAssessment(
      req.params.id,
    );
    res.status(200).send(result);
  };

  unpublishAssessment = async (req: Request, res: Response) => {
    const result = await this.assessmentService.unpublishAssessment(
      req.params.id,
    );
    res.status(200).send(result);
  };
}
