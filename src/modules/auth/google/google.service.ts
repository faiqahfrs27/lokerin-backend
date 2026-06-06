import axios from "axios";
import jwt from "jsonwebtoken";
import { PrismaClient, Provider } from "../../../../generated/prisma/client.js";
import { GoogleUserInfo } from "../../../types/google.js";
import { GoogleDTO } from "./dto/google.dto.js";
import {
  EXPIRED_7_DAY,
  EXPIRED_ACCESS_TOKEN_JWT,
  EXPIRED_REFRESH_TOKEN_JWT,
} from "../constants.js";
import { ApiError } from "../../../utils/api-error.js";

export class GoogleService {
  constructor(private prisma: PrismaClient) {}

  google = async (body: GoogleDTO) => {
    const response = await axios.get<GoogleUserInfo>(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      },
    );

    let user = await this.prisma.user.findUnique({
      where: { email: response.data.email },
      include: {
        profile: true,
        company: true,
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: response.data.email,
          passwordHash: "", // Google user tidak punya password
          provider: Provider.GOOGLE,
          isVerified: true, // Google user langsung verified
          profile: {
            create: {
              fullName: response.data.name,
              photoUrl: response.data.picture ?? null,
            },
          },
        },
        include: {
          profile: true,
          company: true,
        },
      });
    }

    if (user.provider !== Provider.GOOGLE) {
      throw new ApiError("Account already registered without Google", 400);
    }

    const payload = {
      id: user.id,
      role: user.role,
      isVerified: user.isVerified,
      companyId: user.companyId ?? undefined,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: EXPIRED_ACCESS_TOKEN_JWT,
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH!, {
      expiresIn: EXPIRED_REFRESH_TOKEN_JWT,
    });

    await this.prisma.refreshToken.upsert({
      where: { userId: user.id },
      update: {
        token: refreshToken,
        expiresAt: EXPIRED_7_DAY, // fix: expiredAt → expiresAt
      },
      create: {
        token: refreshToken,
        expiresAt: EXPIRED_7_DAY, // fix: expiredAt → expiresAt
        userId: user.id,
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  };
}
