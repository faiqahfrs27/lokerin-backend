import { Request, Response } from "express";
import { SubscriptionPlanService } from "./subscription-plan.service.js";

export class SubscriptionPlanController {
  constructor(private subscriptionPlanService: SubscriptionPlanService) {}

  getPlans = async (req: Request, res: Response) => {
    const result = await this.subscriptionPlanService.getPlans();
    res.status(200).send(result);
  };

  getPlanById = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.subscriptionPlanService.getPlanById(id);
    res.status(200).send(result);
  };

  createPlan = async (req: Request, res: Response) => {
    const result = await this.subscriptionPlanService.createPlan(req.body);
    res.status(201).send(result);
  };

  updatePlan = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.subscriptionPlanService.updatePlan(id, req.body);
    res.status(200).send(result);
  };

  deletePlan = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await this.subscriptionPlanService.deletePlan(id);
    res.status(200).send({ message: "Subscription plan deleted" });
  };
}