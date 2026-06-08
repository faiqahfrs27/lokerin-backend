import { IsString, IsOptional, IsInt, Min, IsEnum } from "class-validator";
import { Type } from "class-transformer";
import { ApplicationStatus } from "../../../../generated/prisma/enums.js";

export class QueryApplicationDTO {
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
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
