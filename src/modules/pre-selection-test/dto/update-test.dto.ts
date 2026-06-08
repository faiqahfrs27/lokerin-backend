import { IsString, IsOptional, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class UpdateTestDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  passingScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(180)
  durationMinutes?: number;
}
