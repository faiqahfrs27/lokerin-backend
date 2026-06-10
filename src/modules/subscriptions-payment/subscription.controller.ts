import { Request, Response } from "express";
import { SubscriptionService } from "./subscription.service.js";
import { ApiError } from "../../utils/api-error.js";

export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  // USER: subscribe with payment proof
  subscribe = async (req: Request, res: Response) => {
    if (!req.file) throw new ApiError("Payment proof is required", 400);
    const userId = res.locals.user.id;
    const result = await this.subscriptionService.subscribe(
      userId,
      req.body.planId,
      req.file,
    );
    res.status(201).send(result);
  };

  // USER: get current subscription
  getMySubscription = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.subscriptionService.getMySubscription(userId);
    res.status(200).send(result);
  };

  // DEV: list payments
  getPayments = async (req: Request, res: Response) => {
    const result = await this.subscriptionService.getPayments();
    res.status(200).send(result);
  };

  // DEV: approve a payment
  approvePayment = async (req: Request, res: Response) => {
    const devId = res.locals.user.id;
    const result = await this.subscriptionService.approvePayment(
      req.params.id,
      devId,
    );
    res.status(200).send(result);
  };

  // DEV: reject a payment
  rejectPayment = async (req: Request, res: Response) => {
    const result = await this.subscriptionService.rejectPayment(req.params.id);
    res.status(200).send(result);
  };
}
