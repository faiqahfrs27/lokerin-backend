import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { CompanyReviewController } from "./company-review.controller.js";
import { CreateReviewDTO } from "./dto/create-review.dto.js";
import { QueryReviewDTO } from "./dto/query-review.dto.js";

export class CompanyReviewRouter {
  private router: Router;

  constructor(
    private companyReviewController: CompanyReviewController,
    private authMiddleware: AuthMiddleware,
    private validationMiddleware: ValidationMiddleware,
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    const auth = this.authMiddleware.verifyToken();

    // PUBLIC: get all reviews for a company
    this.router.get(
      "/:companyId",
      this.validationMiddleware.validateQuery(QueryReviewDTO),
      this.companyReviewController.getReviews,
    );

    // AUTH: check eligibility to review
    this.router.get(
      "/:companyId/eligibility",
      auth,
      this.companyReviewController.checkEligibility,
    );

    // AUTH: check if user already reviewed
    this.router.get(
      "/:companyId/me",
      auth,
      this.companyReviewController.getMyReview,
    );

    // AUTH: submit a review
    this.router.post(
      "/:companyId",
      auth,
      this.validationMiddleware.validateBody(CreateReviewDTO),
      this.companyReviewController.createReview,
    );
  };

  getRouter = () => this.router;
}
