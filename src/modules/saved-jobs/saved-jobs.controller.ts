import { NextFunction, Request, Response } from "express";
import { SavedJobsService } from "./saved-jobs.service.js";
export class SavedJobsController {
  constructor(private savedJobService: SavedJobsService) {}

  saveJob = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = res.locals.user.id;
      const { jobId } = req.body;
      const result = await this.savedJobService.saveJob(userId, jobId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  unsaveJob = async (
    req: Request<{ jobId: string }>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const userId = res.locals.user.id;
      const { jobId } = req.params;
      const result = await this.savedJobService.unsaveJob(userId, jobId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getSavedJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = res.locals.user.id;
      const result = await this.savedJobService.getSavedJobs(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
