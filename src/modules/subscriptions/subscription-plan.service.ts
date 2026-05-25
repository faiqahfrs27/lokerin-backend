import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateSubscriptionPlanDTO } from "./dto/create-subscription-plan.dto.js";
import { UpdateSubscriptionPlanDTO } from "./dto/update-subscription-plan.dto.js";

export class SubscriptionPlanService {
  constructor(private prisma: PrismaClient) {}

  getPlans = async () => {
    return await this.prisma.subscriptionPlan.findMany({
      where: { deletedAt: null },
      orderBy: { price: "asc" },
    });
  };

  getPlanById = async (id: number) => {
    const plan = await this.prisma.subscriptionPlan.findFirst({
      where: { id, deletedAt: null },
    });
    if (!plan) throw new ApiError("Subscription plan not found", 404);
    return plan;
  };

  createPlan = async (body: CreateSubscriptionPlanDTO) => {
    const existing = await this.prisma.subscriptionPlan.findFirst({
      where: { name: body.name, deletedAt: null },
    });
    if (existing) throw new ApiError("Plan name already exists", 409);
    return await this.prisma.subscriptionPlan.create({ data: body });
  };

  updatePlan = async (id: number, body: UpdateSubscriptionPlanDTO) => {
    await this.getPlanById(id);
    return await this.prisma.subscriptionPlan.update({
      where: { id },
      data: body,
    });
  };

  deletePlan = async (id: number) => {
    await this.getPlanById(id);
    return await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  };
}