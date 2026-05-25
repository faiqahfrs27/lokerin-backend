import { Router } from "express";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { CreateSubscriptionPlanDTO } from "./dto/create-subscription-plan.dto.js";
import { UpdateSubscriptionPlanDTO } from "./dto/update-subscription-plan.dto.js";
import { SubscriptionPlanController } from "./subscription-plan.controller.js";

export class SubscriptionPlanRouter {
  private router: Router;

  constructor(
    private subscriptionPlanController: SubscriptionPlanController,
    private validationMiddleware: ValidationMiddleware,
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    this.router.get("/", this.subscriptionPlanController.getPlans);
    this.router.get("/:id", this.subscriptionPlanController.getPlanById);

    // TODO(tim): pasang authMiddleware + roleMiddleware("developer")
    // sebelum validateBody, begitu sistem auth tim sudah ada.
    this.router.post(
      "/",
      this.validationMiddleware.validateBody(CreateSubscriptionPlanDTO),
      this.subscriptionPlanController.createPlan,
    );

    this.router.patch(
      "/:id",
      this.validationMiddleware.validateBody(UpdateSubscriptionPlanDTO),
      this.subscriptionPlanController.updatePlan,
    );

    this.router.delete("/:id", this.subscriptionPlanController.deletePlan);
  };

  getRouter = () => {
    return this.router;
  };
};