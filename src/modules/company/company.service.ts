import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { UpdateCompanyDTO } from "./dto/update-company.dto.js";

export class CompanyService {
  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService,
  ) {}

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
}
