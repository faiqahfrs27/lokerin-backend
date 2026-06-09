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

  updateProfilePhoto = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const result = await this.profileService.updateProfilePhoto(userId, file); // ✅ pass file langsung
    res.status(200).send(result);
  };

  updatePassword = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.profileService.updatePassword(userId, req.body);
    res.status(200).send(result);
  };

  updateEmail = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.profileService.updateEmail(userId, req.body);
    res.status(200).send(result);
  };

  uploadCv = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    const result = await this.profileService.uploadCv(userId, file);
    res.status(200).send(result);
  };
}
