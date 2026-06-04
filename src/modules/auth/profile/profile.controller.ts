import { Request, Response } from "express";
import { ProfileService } from "./profile.service.js";

export class ProfileController {
  constructor(private profileService: ProfileService) {}

  getProfile = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.profileService.getProfile(userId);
    res.status(200).send(result);
  };

  updateProfile = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.profileService.updateProfile(userId, req.body);
    res.status(200).send(result);
  };
}
