import { Request, Response } from "express";
import { CloudinaryService } from "./cloudinary.service.js";

export class CloudinaryController {
  constructor(private cloudinaryService: CloudinaryService) {}

  getUploadSignature = async (_req: Request, res: Response) => {
    const result = this.cloudinaryService.generateUploadSignature("lokerin");
    res.status(200).send(result);
  };
}
