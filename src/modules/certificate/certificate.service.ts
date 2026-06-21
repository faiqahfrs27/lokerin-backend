import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { buildCertificatePdf } from "./certificate-pdf.js";

export class CertificateService {
  constructor(private prisma: PrismaClient) {}

  getMyCertificates = async (userId: string) => {
    return await this.prisma.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      select: {
        id: true,
        code: true,
        issuedAt: true,
        assessment: {
          select: { id: true, title: true, skillCategory: true },
        },
        result: { select: { score: true } },
      },
    });
  };

  verifyByCode = async (code: string) => {
    const cert = await this.prisma.certificate.findUnique({
      where: { code },
      select: {
        code: true,
        issuedAt: true,
        assessment: {
          select: { title: true, skillCategory: true },
        },
        result: { select: { score: true } },
        user: {
          select: { profile: { select: { fullName: true } } },
        },
      },
    });
    if (!cert) throw new ApiError("Certificate not found", 404);

    return {
      valid: true,
      holderName: cert.user.profile?.fullName ?? "Lokerin User",
      skillTitle: cert.assessment.title,
      skillCategory: cert.assessment.skillCategory,
      score: cert.result.score,
      issuedAt: cert.issuedAt,
      code: cert.code,
    };
  };

  generatePdf = async (userId: string, certId: string) => {
    const cert = await this.prisma.certificate.findFirst({
      where: { id: certId, userId },
      select: {
        code: true,
        issuedAt: true,
        assessment: { select: { title: true, skillCategory: true } },
        result: { select: { score: true } },
        user: { select: { profile: { select: { fullName: true } } } },
      },
    });
    if (!cert) throw new ApiError("Certificate not found", 404);

    return await buildCertificatePdf({
      holderName: cert.user.profile?.fullName ?? "Lokerin User",
      skillTitle: cert.assessment.title,
      skillCategory: cert.assessment.skillCategory,
      score: cert.result.score ?? 0,
      issuedAt: cert.issuedAt,
      code: cert.code,
    });
  };
}
