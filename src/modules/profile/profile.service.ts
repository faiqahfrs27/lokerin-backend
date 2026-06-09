import { verify, hash } from "argon2";
import { PrismaClient } from "../../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { CloudinaryService } from "../cloudinary/cloudinary.service.js";
import { MailService } from "../mail/mail.service.js";
import { generateVerificationToken, getExpiryDate } from "../../utils/token.js";
import { VerificationType } from "../../../generated/prisma/enums.js";
import { UpdateProfileDTO } from "./dto/update-profile.dto.js";
import { UpdatePasswordDTO } from "./dto/update-password.dto.js";
import { UpdateEmailDTO } from "./dto/update-email.dto.js";

export class ProfileService {
  constructor(
    private prisma: PrismaClient,
    private cloudinaryService: CloudinaryService,
    private mailService: MailService,
  ) {}

  // ─── GET PROFILE ──────────────────────────────────────────
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

  // ─── UPDATE PROFILE ───────────────────────────────────────
  updateProfile = async (userId: string, body: UpdateProfileDTO) => {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) throw new ApiError("User not found", 404);

    return this.prisma.userProfile.upsert({
      where: { userId },
      update: {
        ...(body.fullName && { fullName: body.fullName }),
        ...(body.birthDate && { birthDate: new Date(body.birthDate) }),
        ...(body.gender && { gender: body.gender }),
        ...(body.education !== undefined && { education: body.education }),
        ...(body.address !== undefined && { address: body.address }),
        ...(body.latitude !== undefined && { latitude: body.latitude }),
        ...(body.longitude !== undefined && { longitude: body.longitude }),
      },
      create: {
        userId,
        fullName: body.fullName ?? "",
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        gender: body.gender ?? null,
        education: body.education ?? null,
        address: body.address ?? null,
        latitude: body.latitude ?? null,
        longitude: body.longitude ?? null,
      },
    });
  };

  // ─── UPLOAD PHOTO ─────────────────────────────────────────
  updateProfilePhoto = async (
    userId: string,
    file: Express.Multer.File, // ✅ ganti parameter
  ) => {
    if (file.size > 1 * 1024 * 1024) {
      throw new ApiError("Photo size must be less than 1MB", 400);
    }

    const result = await this.cloudinaryService.upload(file);
    const photoUrl = result.secure_url;

    return this.prisma.userProfile.upsert({
      where: { userId },
      update: { photoUrl },
      create: { userId, fullName: "", photoUrl },
    });
  };

  // ─── UPDATE PASSWORD ──────────────────────────────────────
  updatePassword = async (userId: string, body: UpdatePasswordDTO) => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new ApiError("User not found", 404);

    if (user.provider !== "CREDENTIALS") {
      throw new ApiError(
        "Password cannot be changed for social login accounts",
        400,
      );
    }

    const isMatch = await verify(user.passwordHash, body.currentPassword);
    if (!isMatch) throw new ApiError("Current password is incorrect", 400);

    const hashedPassword = await hash(body.newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { message: "Password updated successfully" };
  };

  // ─── UPDATE EMAIL ─────────────────────────────────────────
  updateEmail = async (userId: string, body: UpdateEmailDTO) => {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new ApiError("User not found", 404);

    if (user.provider !== "CREDENTIALS") {
      throw new ApiError(
        "Email cannot be changed for social login accounts",
        400,
      );
    }

    // Verifikasi password dulu
    const isMatch = await verify(user.passwordHash, body.password);
    if (!isMatch) throw new ApiError("Password is incorrect", 400);

    // Cek email baru belum dipakai
    const existing = await this.prisma.user.findUnique({
      where: { email: body.newEmail },
    });
    if (existing) throw new ApiError("Email is already in use", 400);

    // Update email + set isVerified false + kirim verification email
    const token = generateVerificationToken();
    const expiresAt = getExpiryDate(1);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { email: body.newEmail, isVerified: false },
      }),
      this.prisma.verification.create({
        data: {
          userId,
          token,
          type: VerificationType.email_verification,
          expiresAt,
        },
      }),
    ]);

    const verifyUrl = `${process.env.BASE_URL_FE}/verify-email?token=${token}`;

    try {
      await this.mailService.sendMail({
        to: body.newEmail,
        subject: "Verify your new email",
        templateName: "verification",
        context: { name: user.email, verifyUrl },
      });
    } catch {
      console.error("Failed to send verification email");
    }

    return { message: "Email updated. Please verify your new email." };
  };

  uploadCv = async (userId: string, file: Express.Multer.File) => {
    const result = await this.cloudinaryService.uploadFile(file);
    return { cvUrl: result.secure_url };
  };
}
