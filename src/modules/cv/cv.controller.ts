import { Request, Response } from "express";
import { CvService } from "./cv.service.js";

export class CvController {
  constructor(private cvService: CvService) {}

  // GET /api/cv — get CV data
  getCv = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.cvService.getCv(userId);
    res.status(200).send(result);
  };

  // POST /api/cv — save CV data
  saveCv = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.cvService.saveCv(userId, req.body);
    res.status(200).send(result);
  };

  // GET /api/cv/download — stream PDF to browser
  downloadCv = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const pdfBuffer = await this.cvService.downloadCv(userId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="lokerin-cv.pdf"`,
    );
    res.send(pdfBuffer);
  };
}
