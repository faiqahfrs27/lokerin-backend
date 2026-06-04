import { IsDateString, IsEnum, IsOptional, IsString } from "class-validator";

enum Gender {
  male = "male",
  female = "female",
}

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
