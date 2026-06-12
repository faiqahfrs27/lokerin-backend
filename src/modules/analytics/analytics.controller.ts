import { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service.js";

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  getOverview = async (_req: Request, res: Response) => {
    const companyId = res.locals.user?.companyId as string | undefined;
    const result = await this.analyticsService.getOverview(companyId);
    res.status(200).send(result);
  };
}
