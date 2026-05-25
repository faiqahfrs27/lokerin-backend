import { NextFunction, Request, Response } from "express";
import { VerifyEmailService } from "./verify-email.service.js";

export class VerifyEmailController {
  constructor(private verifyEmailService: VerifyEmailService) {}

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Karena pakai validateQuery, token sudah ada di req.query.token (validated)
      const result = await this.verifyEmailService.verifyEmail({
        token: req.query.token as string,
      });

      res.status(200).json({
        message: result.message,
        data: { email: result.email },
      });
    } catch (err) {
      next(err);
    }
  };
}
