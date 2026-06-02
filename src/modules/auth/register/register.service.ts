import { hash } from "argon2";
import { PrismaClient, Role } from "../../../../generated/prisma/client.js";
import { VerificationType } from "../../../../generated/prisma/enums.js";
import { ApiError } from "../../../utils/api-error.js";
import {
  generateVerificationToken,
  getExpiryDate,
} from "../../../utils/token.js";
import { RegisterDTO } from "./dto/register.dto.js";
import { MailService } from "../../mail/mail.service.js";

export class RegisterService {
  constructor(
    private prisma: PrismaClient,
    private mailService: MailService,
  ) {}

  register = async (body: RegisterDTO) => {
    // 1. Cek email sudah terdaftar
    const existingUser = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      throw new ApiError("Email is already registered!", 400);
    }

    // 2. Tentukan role (default: user)
    const role: Role = body.role ?? Role.user;

    // 3. Hash password
    const hashedPassword = await hash(body.password);

    // 4. Generate verification token (1 jam expiry sesuai spec)
    const token = generateVerificationToken();
    const expiresAt = getExpiryDate(1);

    // 5. Buat user di DB (atomic transaction)
    const user = await this.prisma.$transaction(async (tx) => {
      // Kalau admin, buat company dulu
      let companyId: string | undefined;

      if (role === Role.admin) {
        const existingCompany = await tx.company.findUnique({
          where: { email: body.email },
        });

        if (existingCompany) {
          throw new ApiError("Email is already registered!", 400);
        }

        const company = await tx.company.create({
          data: {
            name: body.companyName!,
            email: body.email,
            phone: body.phone!,
          },
        });

        companyId = company.id;
      }

      // Buat user + profile (kalau user biasa) + verification token
      return tx.user.create({
        data: {
          email: body.email,
          passwordHash: hashedPassword,
          role,
          provider: "local",
          ...(companyId && { companyId }),
          ...(role === Role.user && {
            profile: {
              create: { fullName: body.name },
            },
          }),
          verifications: {
            create: {
              token,
              type: VerificationType.email_verification,
              expiresAt,
            },
          },
        },
        select: {
          id: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true,
          profile: { select: { fullName: true } },
          company: { select: { id: true, name: true, phone: true } },
        },
      });
    });

    // 6. Kirim email verifikasi (di luar transaction)
    const recipientName = role === Role.admin ? body.companyName! : body.name;
    const verifyUrl = `${process.env.BASE_URL_FE}/verify-email?token=${token}`;

    try {
      await this.mailService.sendMail({
        to: body.email,
        subject: "Verify your email",
        templateName: "verification",
        context: {
          name: recipientName,
          verifyUrl,
        },
      });
    } catch (err) {
      console.error("Failed to send verification email:", err);
      // Tidak throw - user tetap terdaftar, bisa request resend nanti
    }
    return user;
  };
}
