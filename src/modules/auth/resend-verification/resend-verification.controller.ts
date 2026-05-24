import { NextFunction, Request, Response } from "express";
import { ResendVerificationService } from "./resend-verification.service.js";

export class ResendVerificationController {
  constructor(private resendVerificationService: ResendVerificationService) {}

  resendVerification = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.resendVerificationService.resendVerification(
        req.body,
      );

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
