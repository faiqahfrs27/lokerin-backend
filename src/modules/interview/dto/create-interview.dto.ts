import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from "class-validator";

export class CreateInterviewDTO {
  @IsNotEmpty()
  @IsUUID()
  applicationId!: string;

  @IsNotEmpty()
  @IsISO8601()
  scheduledAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
