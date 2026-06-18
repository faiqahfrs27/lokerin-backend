import { PrismaClient } from "../../../generated/prisma/client.js";
import { buildCvPdf, CvEducation, CvExperience } from "./cv-template.js";
import { SaveCvDTO } from "./dto/save-cv.dto.js";

export class CvService {
  constructor(private prisma: PrismaClient) {}

  // Get CV profile data for the current user
  getCv = async (userId: string) => {
    const cv = await this.prisma.cvProfile.findUnique({
      where: { userId },
    });

    // Return empty structure if no CV profile yet
    if (!cv) {
      return {
        summary: "",
        phone: "",
        portfolioUrl: "",
        experiences: [],
        educations: [],
        additionalSkills: [],
      };
    }

    return cv;
  };

  // Save or update CV profile data
  saveCv = async (userId: string, body: SaveCvDTO) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toJson = (val: any) => val ?? [];

    return await this.prisma.cvProfile.upsert({
      where: { userId },
      update: {
        summary: body.summary ?? "",
        phone: body.phone ?? "",
        portfolioUrl: body.portfolioUrl ?? "",
        experiences: toJson(body.experiences),
        educations: toJson(body.educations),
        additionalSkills: toJson(body.additionalSkills),
      },
      create: {
        userId,
        summary: body.summary ?? "",
        phone: body.phone ?? "",
        portfolioUrl: body.portfolioUrl ?? "",
        experiences: toJson(body.experiences),
        educations: toJson(body.educations),
        additionalSkills: toJson(body.additionalSkills),
      },
    });
  };

  // Download CV — generate PDF and return buffer
  downloadCv = async (userId: string): Promise<Buffer> => {
    const [user, cv, badges] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          profile: {
            select: {
              fullName: true,
              address: true,
              gender: true,
              birthDate: true,
            },
          },
        },
      }),
      this.prisma.cvProfile.findUnique({ where: { userId } }),
      this.prisma.badgeEarned.findMany({
        where: { userId },
        include: { assessment: { select: { title: true } } },
      }),
    ]);

    if (!user) throw new Error("User not found");

    // Extract verified skill names from badges
    const verifiedSkills = badges.map((b) => b.assessment.title);

    const pdfBuffer = await buildCvPdf({
      fullName: user.profile?.fullName ?? "—",
      email: user.email,
      phone: cv?.phone ?? "",
      address: user.profile?.address ?? "",
      gender: user.profile?.gender ?? undefined,
      birthDate: user.profile?.birthDate
        ? user.profile.birthDate.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : undefined,
      portfolioUrl: cv?.portfolioUrl ?? "",
      summary: cv?.summary ?? "",
      experiences: (cv?.experiences as unknown as CvExperience[]) ?? [],
      educations: (cv?.educations as unknown as CvEducation[]) ?? [],
      additionalSkills: (cv?.additionalSkills as unknown as string[]) ?? [],
      verifiedSkills,
    });

    return pdfBuffer;
  };
}
