import { Request, Response } from "express";
import { ApplicationService } from "./application.service.js";
import { QueryApplicationDTO } from "./dto/query-application.dto.js";

export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  private getUserId = (res: Response): string | undefined => {
    return res.locals.user?.id;
  };

  createApplication = async (req: Request, res: Response) => {
    const userId = this.getUserId(res);
    const result = await this.applicationService.createApplication(
      userId,
      req.body,
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
}
