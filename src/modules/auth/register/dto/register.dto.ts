import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";
import { Role } from "../../../../../generated/prisma/enums.js";

export class RegisterDTO {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  role?: Role;

  @IsOptional()
  @IsString()
  referralCode?: string;

  // Wajib diisi kalau role = admin
  @ValidateIf((obj) => obj.role === "admin")
  @IsNotEmpty({ message: "Company name is required for admin registration" })
  @IsString()
  companyName?: string;

  @ValidateIf((obj) => obj.role === "admin")
  @IsNotEmpty({ message: "Phone is required for admin registration" })
  @IsString()
  phone?: string;
}
