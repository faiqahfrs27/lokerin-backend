import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class UpdateAssessmentDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  skillCategory?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  passingScore?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  durationMin?: number;
}
