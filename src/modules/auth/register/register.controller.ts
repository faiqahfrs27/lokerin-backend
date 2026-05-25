import { NextFunction, Request, Response } from "express";
import { RegisterService } from "./register.service.js";

export class RegisterController {
  constructor(private registerService: RegisterService) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.registerService.register(req.body);

      res.status(201).json({
        message:
          "Registration successful. Please check your email for verification.",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  };
}
