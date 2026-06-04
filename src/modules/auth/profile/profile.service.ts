import { PrismaClient } from "../../../../generated/prisma/client.js";
import { ApiError } from "../../../utils/api-error.js";
import { UpdateProfileDTO } from "./dto/update-profile.dto.js";

export class ProfileService {
  constructor(private prisma: PrismaClient) {}

  getProfile = async (userId: string) => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        companyId: true,
        provider: true,
        createdAt: true,
        profile: true,
        company: {
          select: {
            id: true,
            name: true,
            phone: true,
            city: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!user) throw new ApiError("User not found", 404);

    return user;
  };

  updateProfile = async (userId: string, body: UpdateProfileDTO) => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) throw new ApiError("User not found", 404);

    const profile = await this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(body.fullName && { fullName: body.fullName }),
        ...(body.birthDate && { birthDate: new Date(body.birthDate) }),
        ...(body.gender && { gender: body.gender }),
        ...(body.education !== undefined && { education: body.education }),
        ...(body.address !== undefined && { address: body.address }),
      },
      create: {
        userId,
        fullName: body.fullName ?? "",
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        gender: body.gender ?? null,
        education: body.education ?? null,
        address: body.address ?? null,
      },
    });

    return profile;
  };
}
