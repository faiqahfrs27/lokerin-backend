import { Request, Response } from "express";
import { XenditService } from "./xendit.service.js";

export class XenditController {
  constructor(private xenditService: XenditService) {}

  createInvoice = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const { planId } = req.body;
    const result = await this.xenditService.createInvoice(userId, planId);
    res.status(201).send(result);
  };

  handleWebhook = async (req: Request, res: Response) => {
    const callbackToken = req.headers["x-callback-token"] as string;
    const result = await this.xenditService.handleWebhook(
      callbackToken,
      req.body,
    );
    res.status(200).send(result);
  };
}
