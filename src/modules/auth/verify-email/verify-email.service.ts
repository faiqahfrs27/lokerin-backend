import { PrismaClient } from "../../../../generated/prisma/client.js";
import { VerificationType } from "../../../../generated/prisma/enums.js";
import { ApiError } from "../../../utils/api-error.js";
import { VerifyEmailDTO } from "./dto/verify-email.dto.js";

export class VerifyEmailService {
  constructor(private prisma: PrismaClient) {}

  verifyEmail = async (body: VerifyEmailDTO) => {
    const verification = await this.prisma.verification.findUnique({
      where: { token: body.token },
      include: { user: true },
    });

    if (!verification) {
      throw new ApiError("Invalid verification token", 404);
    }

    if (verification.type !== VerificationType.email_verification) {
      throw new ApiError("Invalid token type", 400);
    }

    if (verification.used) {
      throw new ApiError("Token has already been used", 400);
    }

    if (verification.expiresAt < new Date()) {
      throw new ApiError(
        "Token has expired. Please request a new verification email",
        400,
      );
    }

    if (verification.user.isVerified) {
      throw new ApiError("Email is already verified", 400);
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: verification.userId },
        data: { isVerified: true },
      }),
      this.prisma.verification.update({
        where: { id: verification.id },
        data: { used: true },
      }),
    ]);

    return {
      email: verification.user.email,
      message: "Email verified successfully. Please login to continue.",
    };
  };
}
