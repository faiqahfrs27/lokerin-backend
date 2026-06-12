import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import {
  computeAgeDistribution,
  computeAvgSalaryByCategory,
  computeByCategory,
  computeEducationDistribution,
  computeGenderDistribution,
  computeTopCities,
} from "./analytics.helpers.js";

export class AnalyticsService {
  constructor(private prisma: PrismaClient) {}

  getOverview = async (companyId: string | undefined) => {
    if (!companyId) {
      throw new ApiError("Your account is not linked to a company", 403);
    }

    const [totalJobs, totalApplicants, acceptedCount, interviewsCount] =
      await Promise.all([
        this.prisma.job.count({ where: { companyId } }),
        this.prisma.application.count({ where: { job: { companyId } } }),
        this.prisma.application.count({
          where: { job: { companyId }, status: "accepted" },
        }),
        this.prisma.interview.count({
          where: { application: { job: { companyId } } },
        }),
      ]);

    const applications = await this.prisma.application.findMany({
      where: { job: { companyId } },
      include: {
        user: {
          select: {
            profile: {
              select: {
                gender: true,
                birthDate: true,
                education: true,
              },
            },
          },
        },
        job: {
          select: {
            city: true,
            category: { select: { name: true } },
          },
        },
      },
    });

    return {
      summary: {
        totalJobs,
        totalApplicants,
        acceptedCount,
        interviewsCount,
      },
      genderDistribution: computeGenderDistribution(applications),
      ageDistribution: computeAgeDistribution(applications),
      educationDistribution: computeEducationDistribution(applications),
      applicantsByCategory: computeByCategory(applications),
      avgSalaryByCategory: computeAvgSalaryByCategory(applications),
      topCities: computeTopCities(applications),
    };
  };
}
