import { Request, Response } from "express";
import { CompanyReviewService } from "./company-review.service.js";
import { QueryReviewDTO } from "./dto/query-review.dto.js";

export class CompanyReviewController {
  constructor(private companyReviewService: CompanyReviewService) {}

  checkEligibility = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.companyReviewService.checkEligibility(
      userId,
      req.params.companyId as string,
    );
    res.status(200).send(result);
  };

  createReview = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.companyReviewService.createReview(
      userId,
      req.params.companyId as string,
      req.body,
    );
    res.status(201).send(result);
  };

  getReviews = async (req: Request, res: Response) => {
    const query = req.query as unknown as QueryReviewDTO;
    const result = await this.companyReviewService.getReviews(
      req.params.companyId as string,
      query,
    );
    res.status(200).send(result);
  };

  getMyReview = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.companyReviewService.getMyReview(
      userId,
      req.params.companyId as string,
    );
    res.status(200).send(result);
  };
}
