import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from "class-validator";

export class QueryApplicantDTO {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsUUID()
  jobId?: string;

  @IsOptional()
  @IsIn(["pending", "reviewed", "accepted", "rejected"])
  status?: "pending" | "reviewed" | "accepted" | "rejected";

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsIn(["appliedAt", "expectedSalary", "status"])
  sortBy?: "appliedAt" | "expectedSalary" | "status" = "appliedAt";

  @IsOptional()
  @IsIn(["asc", "desc"])
  sortOrder?: "asc" | "desc" = "desc";
}
