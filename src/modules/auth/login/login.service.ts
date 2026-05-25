import { verify } from "argon2";
import { PrismaClient } from "../../../../generated/prisma/client.js";
import { ApiError } from "../../../utils/api-error.js";
import jwt from "jsonwebtoken";
import { LoginDTO } from "./dto/login.dto.js";
import {
  EXPIRED_7_DAY,
  EXPIRED_ACCESS_TOKEN_JWT,
  EXPIRED_REFRESH_TOKEN_JWT,
} from "../constants.js";

export class LoginService {
  constructor(private prisma: PrismaClient) {}

  login = async (body: LoginDTO) => {
    const user = await this.prisma.user.findFirst({
      where: {
        email: body.email,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new ApiError("Invalid Credentials", 400);
    }

    const isPassMatch = await verify(user.passwordHash, body.password);

    if (!isPassMatch) {
      throw new ApiError("Invalid Email or Password", 401);
    }

    const payload = { id: user.id, role: user.role };

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
        expiresAt: EXPIRED_7_DAY,
      },
      create: {
        token: refreshToken,
        expiresAt: EXPIRED_7_DAY,
        userId: user.id,
      },
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  };
}
