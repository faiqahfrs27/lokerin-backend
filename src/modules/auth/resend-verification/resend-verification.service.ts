import { PrismaClient } from "../../../../generated/prisma/client.js";
import { VerificationType } from "../../../../generated/prisma/enums.js";
import { ApiError } from "../../../utils/api-error.js";
import {
  generateVerificationToken,
  getExpiryDate,
} from "../../../utils/token.js";
import { MailService } from "../../mail/mail.service.js";
import { ResendVerificationDTO } from "./dto/resend-verification.dto.js";

export class ResendVerificationService {
  constructor(
    private prisma: PrismaClient,
    private mailService: MailService,
  ) {}

  resendVerification = async (body: ResendVerificationDTO) => {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      include: {
        profile: { select: { fullName: true } },
        company: { select: { name: true } },
      },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    if (user.isVerified) {
      throw new ApiError("Email is already verified", 400);
    }

    // Invalidate token lama
    await this.prisma.verification.updateMany({
      where: {
        userId: user.id,
        type: VerificationType.email_verification,
        used: false,
      },
      data: { used: true },
    });

    // Generate token baru (1 jam)
    const token = generateVerificationToken();
    const expiresAt = getExpiryDate(1);

    await this.prisma.verification.create({
      data: {
        userId: user.id,
        token,
        type: VerificationType.email_verification,
        expiresAt,
      },
    });

    // Kirim email pakai MailService + template hbs
    const recipientName =
      user.profile?.fullName ?? user.company?.name ?? "there";
    const verifyUrl = `${process.env.PORT}/api/auth/verify-email?token=${token}`;

    try {
      await this.mailService.sendMail({
        to: user.email,
        subject: "Verify your email",
        templateName: "verification",
        context: {
          name: recipientName,
          verifyUrl,
        },
      });
    } catch (err) {
      console.error("Failed to send verification email:", err);
      throw new ApiError(
        "Failed to send verification email. Please try again later",
        500,
      );
    }

    return {
      message: "Verification email has been sent. Please check your inbox.",
    };
  };
}
