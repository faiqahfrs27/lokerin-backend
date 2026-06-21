import { Request, Response } from "express";
import { BadgeService } from "./badge.service.js";

export class BadgeController {
  constructor(private badgeService: BadgeService) {}

  getMyBadges = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.badgeService.getMyBadges(userId);
    res.status(200).send(result);
  };
}
