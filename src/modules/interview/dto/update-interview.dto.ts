import { IsISO8601, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateInterviewDTO {
  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
