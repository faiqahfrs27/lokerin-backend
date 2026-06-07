import { Request, Response } from "express";
import { AssessmentQuestionService } from "./assessment-question.service.js";

export class AssessmentQuestionController {
  constructor(private assessmentQuestionService: AssessmentQuestionService) {}

  addQuestion = async (req: Request, res: Response) => {
    const result = await this.assessmentQuestionService.addQuestion(
      req.params.id,
      req.body,
    );
    res.status(201).send(result);
  };

  updateQuestion = async (req: Request, res: Response) => {
    const result = await this.assessmentQuestionService.updateQuestion(
      req.params.questionId,
      req.body,
    );
    res.status(200).send(result);
  };

  deleteQuestion = async (req: Request, res: Response) => {
    await this.assessmentQuestionService.deleteQuestion(req.params.questionId);
    res.status(200).send({ message: "Question deleted" });
  };
}
