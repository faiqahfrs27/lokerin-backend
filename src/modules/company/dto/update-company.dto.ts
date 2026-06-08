import { IsOptional, IsString } from "class-validator";

export class UpdateCompanyDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  descriptionRte?: string;
}
