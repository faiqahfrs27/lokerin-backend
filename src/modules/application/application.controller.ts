import { Request, Response } from "express";
import { ApplicationService } from "./application.service.js";
import { QueryApplicationDTO } from "./dto/query-application.dto.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { Role } from "../../../generated/prisma/enums.js";

export class ApplicationController {
  constructor(
    private applicationService: ApplicationService,
    private cloudinaryService: CloudinaryService,
  ) {}

  private getUserId = (res: Response): string | undefined => {
    return res.locals.user?.id;
  };

  private getUserRole = (res: Response): string | undefined => {
    return res.locals.user?.role;
  };

  createApplication = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const file = req.file; // CV PDF dari multer

    let cvData: { publicId: string; secureUrl: string } | undefined;

    if (file) {
      const uploaded = await this.cloudinaryService.uploadFile(file);
      cvData = {
        publicId: uploaded.public_id,
        secureUrl: uploaded.secure_url,
      };
    }

    const result = await this.applicationService.createApplication(
      userId,
      req.body,
      cvData,
    );

    res.status(201).send(result);
  };

  getMyApplications = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const query = req.query as unknown as QueryApplicationDTO;
    const result = await this.applicationService.getMyApplications(
      userId,
      query,
    );
    res.status(200).send(result);
  };

  getApplicationById = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const id = req.params.id as string;
    const result = await this.applicationService.getApplicationById(id, userId);
    res.status(200).send(result);
  };

  // GET /api/applications/:id/cv
  getCvSignedUrl = async (req: Request, res: Response) => {
    const requesterId = this.getUserId(res);
    const requesterRole = this.getUserRole(res);
    const applicationId = req.params.id as string;

    const application =
      await this.applicationService.findApplicationOrThrow(applicationId);

    const isSelf = application.userId === requesterId;
    const isCompanyOrAdmin =
      requesterRole === Role.admin || requesterRole === Role.dev;

    if (!isSelf && !isCompanyOrAdmin) {
      res.status(403).send({ message: "Forbidden" });
      return;
    }

    if (!application.cvUrl) {
      res.status(404).send({ message: "CV tidak ditemukan" });
      return;
    }

    res.status(200).send({ url: application.cvUrl });
  };
}
