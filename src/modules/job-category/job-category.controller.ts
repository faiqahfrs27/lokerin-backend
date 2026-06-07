import { Request, Response } from "express";
import { JobCategoryService } from "./job-category.service.js";

export class JobCategoryController {
  constructor(private jobCategoryService: JobCategoryService) {}

  getAll = async (_req: Request, res: Response) => {
    const result = await this.jobCategoryService.getAll();
    res.status(200).send(result);
  };
}
