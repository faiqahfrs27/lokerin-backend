import { Request, Response } from "express";
import { CompanyReviewService } from "./company-review.service.js";

export class CompanyReviewController {
  constructor(private companyReviewService: CompanyReviewService) {}

  // GET /api/company-reviews/:companyId/eligibility
  checkEligibility = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.companyReviewService.checkEligibility(
      userId,
      req.params.companyId as string,
    );
    res.status(200).send(result);
  };

  // POST /api/company-reviews/:companyId
  createReview = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.companyReviewService.createReview(
      userId,
      req.params.companyId as string,
      req.body,
    );
    res.status(201).send(result);
  };

  // GET /api/company-reviews/:companyId
  getReviews = async (req: Request, res: Response) => {
    const result = await this.companyReviewService.getReviews(
      req.params.companyId as string,
    );
    res.status(200).send(result);
  };

  // GET /api/company-reviews/:companyId/me
  getMyReview = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.companyReviewService.getMyReview(
      userId,
      req.params.companyId as string,
    );
    res.status(200).send(result);
  };
}
