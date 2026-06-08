import { IsString, IsInt, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export class QueryTestDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
