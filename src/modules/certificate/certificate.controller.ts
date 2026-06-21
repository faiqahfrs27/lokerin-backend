import { Request, Response } from "express";
import { CertificateService } from "./certificate.service.js";

export class CertificateController {
  constructor(private certificateService: CertificateService) {}

  getMyCertificates = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const result = await this.certificateService.getMyCertificates(userId);
    res.status(200).send(result);
  };

  verifyByCode = async (req: Request, res: Response) => {
    const result = await this.certificateService.verifyByCode(
      req.params.code as string,
    );
    res.status(200).send(result);
  };

  downloadCertificate = async (req: Request, res: Response) => {
    const userId = res.locals.user.id;
    const pdf = await this.certificateService.generatePdf(
      userId,
      req.params.id as string,
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="certificate-${req.params.id}.pdf"`,
    );
    res.send(pdf);
  };
}
