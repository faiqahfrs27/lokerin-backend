import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CreateReviewDTO } from "./dto/create-review.dto.js";

export class CompanyReviewService {
  constructor(private prisma: PrismaClient) {}

  // Check if user is eligible to review (accepted applicant at company)
  checkEligibility = async (userId: string, companyId: string) => {
    const accepted = await this.prisma.application.findFirst({
      where: {
        userId,
        status: "accepted",
        job: { companyId },
      },
    });
    return { eligible: !!accepted };
  };

  // Submit a review for a company
  createReview = async (
    userId: string,
    companyId: string,
    body: CreateReviewDTO,
  ) => {
    // Check company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new ApiError("Company not found", 404);

    // Check eligibility
    const { eligible } = await this.checkEligibility(userId, companyId);
    if (!eligible) {
      throw new ApiError(
        "Only verified employees can review this company",
        403,
      );
    }

    // Check if already reviewed
    const existing = await this.prisma.companyReview.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });
    if (existing)
      throw new ApiError("You have already reviewed this company", 400);

    return await this.prisma.companyReview.create({
      data: {
        companyId,
        userId,
        position: body.position,
        salaryEstimate: body.salaryEstimate,
        content: body.content,
        cultureRating: body.cultureRating,
        worklifeRating: body.worklifeRating,
        facilityRating: body.facilityRating,
        careerRating: body.careerRating,
      },
    });
  };

  // Get all reviews for a company (anonymous, paginated)
  getReviews = async (
    companyId: string,
    query: { page?: number; limit?: number },
  ) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const [reviews, total] = await Promise.all([
      this.prisma.companyReview.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          position: true,
          salaryEstimate: true,
          content: true,
          cultureRating: true,
          worklifeRating: true,
          facilityRating: true,
          careerRating: true,
          createdAt: true,
        },
      }),
      this.prisma.companyReview.count({ where: { companyId } }),
    ]);

    const data = reviews.map((r) => ({
      ...r,
      overallRating: Math.round(
        (r.cultureRating +
          r.worklifeRating +
          r.facilityRating +
          r.careerRating) /
          4,
      ),
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  // Check if current user has already reviewed this company
  getMyReview = async (userId: string, companyId: string) => {
    const review = await this.prisma.companyReview.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });
    return { hasReviewed: !!review, review };
  };
}
