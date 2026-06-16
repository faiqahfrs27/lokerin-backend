import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateReviewDTO {
  @IsString()
  position!: string;

  @IsOptional()
  @IsInt()
  salaryEstimate?: number;

  @IsString()
  content!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  cultureRating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  worklifeRating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  facilityRating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  careerRating!: number;
}
