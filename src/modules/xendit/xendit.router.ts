import { Router } from "express";
import { AuthMiddleware } from "../../middlewares/auth.middleware.js";
import { XenditController } from "./xendit.controller.js";

export class XenditRouter {
  private router: Router;

  constructor(
    private xenditController: XenditController,
    private authMiddleware: AuthMiddleware,
  ) {
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    const auth = this.authMiddleware.verifyToken();

    // USER: create invoice (requires authentication)
    this.router.post("/invoice", auth, this.xenditController.createInvoice);

    // PUBLIC: webhook endpoint for Xendit payment notifications
    this.router.post("/webhook", this.xenditController.handleWebhook);
  };

  getRouter = () => this.router;
}
