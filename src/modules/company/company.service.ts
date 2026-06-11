import { Prisma, PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { UpdateCompanyDTO } from "./dto/update-company.dto.js";

export class CompanyService {
  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService,
  ) {}

  // ─── ADMIN ────────────────────────────────────────────────

  getCompany = async (companyId: string | undefined) => {
    if (!companyId) throw new ApiError("Not linked to a company", 403);

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) throw new ApiError("Company not found", 404);
    return company;
  };

  updateCompany = async (
    companyId: string | undefined,
    body: UpdateCompanyDTO,
  ) => {
    if (!companyId) throw new ApiError("Not linked to a company", 403);

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new ApiError("Company not found", 404);

    return this.prisma.company.update({
      where: { id: companyId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.descriptionRte !== undefined && {
          descriptionRte: body.descriptionRte,
        }),
      },
    });
  };

  updateLogo = async (
    companyId: string | undefined,
    file: Express.Multer.File,
  ) => {
    if (!companyId) throw new ApiError("Not linked to a company", 403);

    const result = await this.cloudinaryService.upload(file);
    const logoUrl = result.secure_url;

    return this.prisma.company.update({
      where: { id: companyId },
      data: { logoUrl },
    });
  };

  // ─── PUBLIC ───────────────────────────────────────────────

  getPublicCompanies = async (query: {
    search?: string;
    city?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 12);
    const sortBy = query.sortBy ?? "name";
    const sortOrder = query.sortOrder ?? "asc";

    const where: Prisma.CompanyWhereInput = {};

    if (query.search) {
      where.name = { contains: query.search, mode: "insensitive" };
    }
    if (query.city) {
      where.city = { contains: query.city, mode: "insensitive" };
    }

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        select: {
          id: true,
          name: true,
          city: true,
          logoUrl: true,
          _count: { select: { jobs: { where: { isPublished: true } } } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  };

  getPublicCompanyById = async (id: string) => {
    const company = await this.prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        logoUrl: true,
        descriptionRte: true,
        jobs: {
          where: { isPublished: true },
          select: {
            id: true,
            title: true,
            city: true,
            salary: true,
            deadline: true,
            hasTest: true,
            createdAt: true,
            tags: true,
            category: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!company) throw new ApiError("Company not found", 404);
    return company;
  };
}
