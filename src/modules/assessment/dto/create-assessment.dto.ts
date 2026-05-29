import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

export class CreateAssessmentDTO {
  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsNotEmpty()
  @IsString()
  skillCategory!: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  passingScore?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  durationMin?: number;
}
