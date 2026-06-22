import { Request, Response } from "express";
import { SubscriptionService } from "./subscription.service.js";
import { ApiError } from "../../utils/api-error.js";
import { QueryPaginationDTO } from "./dto/query-pagination.dto.js";

export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

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

  getMySubscription = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.subscriptionService.getMySubscription(userId);
    res.status(200).send(result);
  };

  getPayments = async (req: Request, res: Response) => {
    const query = req.query as unknown as QueryPaginationDTO;
    const result = await this.subscriptionService.getPayments(query);
    res.status(200).send(result);
  };

  approvePayment = async (req: Request, res: Response) => {
    const devId = res.locals.user.id;
    const result = await this.subscriptionService.approvePayment(
      req.params.id as string,
      devId,
    );
    res.status(200).send(result);
  };

  rejectPayment = async (req: Request, res: Response) => {
    const result = await this.subscriptionService.rejectPayment(
      req.params.id as string,
    );
    res.status(200).send(result);
  };

  getSubscribers = async (req: Request, res: Response) => {
    const query = req.query as unknown as QueryPaginationDTO;
    const result = await this.subscriptionService.getSubscribers(query);
    res.status(200).send(result);
  };

  getSubscriberStats = async (req: Request, res: Response) => {
    const result = await this.subscriptionService.getSubscriberStats();
    res.status(200).send(result);
  };
}
