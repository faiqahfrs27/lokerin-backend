import { IsUUID, IsUrl, IsOptional, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateApplicationDTO {
  @IsUUID()
  jobId!: string;

  @IsUrl()
  cvUrl!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  expectedSalary?: number;

  @IsOptional()
  @IsUUID()
  testAttemptId?: string;
}
