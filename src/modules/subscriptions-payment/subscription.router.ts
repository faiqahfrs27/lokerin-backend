import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { UploadMiddleware } from "../../middlewares/upload.middleware.js";
import { ValidationMiddleware } from "../../middlewares/validation.middleware.js";
import { SubscriptionController } from "./subscription.controller.js";
import { SubscribeDTO } from "./dto/subscribe.dto.js";
import { Role } from "../../../generated/prisma/enums.js";

export class SubscriptionRouter {
  private router: Router;

  constructor(
    private subscriptionController: SubscriptionController,
    private authMiddleware: AuthMiddleware,
    private validationMiddleware: ValidationMiddleware,
    private uploadMiddleware: UploadMiddleware,
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    const auth = this.authMiddleware.verifyToken();
    const devOnly = this.authMiddleware.verifyRole([Role.dev]);
    const upload = this.uploadMiddleware.upload(2);

    // USER routes
    this.router.post(
      "/subscribe",
      auth,
      upload.single("proof"),
      this.validationMiddleware.validateBody(SubscribeDTO),
      this.subscriptionController.subscribe,
    );
    this.router.get("/me", auth, this.subscriptionController.getMySubscription);

    // DEV routes
    this.router.get(
      "/payments",
      auth,
      devOnly,
      this.subscriptionController.getPayments,
    );
    this.router.patch(
      "/payments/:id/approve",
      auth,
      devOnly,
      this.subscriptionController.approvePayment,
    );
    this.router.patch(
      "/payments/:id/reject",
      auth,
      devOnly,
      this.subscriptionController.rejectPayment,
    );
  };

  getRouter = () => {
    return this.router;
  };
}
