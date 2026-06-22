import { Request, Response } from "express";
import { AssessmentService } from "./assessment.service.js";

export class AssessmentController {
  constructor(private assessmentService: AssessmentService) {}

  getPublishedAssessments = async (req: Request, res: Response) => {
    const result = await this.assessmentService.getPublishedAssessments();
    res.status(200).send(result);
  };

  getAssessments = async (req: Request, res: Response) => {
    const result = await this.assessmentService.getAssessments();
    res.status(200).send(result);
  };

  getAssessmentById = async (req: Request, res: Response) => {
    const result = await this.assessmentService.getAssessmentById(
      req.params.id as string,
    );
    res.status(200).send(result);
  };

  createAssessment = async (req: Request, res: Response) => {
    const result = await this.assessmentService.createAssessment(req.body);
    res.status(201).send(result);
  };

  updateAssessment = async (req: Request, res: Response) => {
    const result = await this.assessmentService.updateAssessment(
      req.params.id as string,
      req.body,
    );
    res.status(200).send(result);
  };

  deleteAssessment = async (req: Request, res: Response) => {
    await this.assessmentService.deleteAssessment(req.params.id as string);
    res.status(200).send({ message: "Assessment deleted" });
  };

  publishAssessment = async (req: Request, res: Response) => {
    const result = await this.assessmentService.publishAssessment(
      req.params.id as string,
    );
    res.status(200).send(result);
  };

  unpublishAssessment = async (req: Request, res: Response) => {
    const result = await this.assessmentService.unpublishAssessment(
      req.params.id as string,
    );
    res.status(200).send(result);
  };
}
