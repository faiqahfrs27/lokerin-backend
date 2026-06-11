import { IsOptional, IsString, IsArray } from "class-validator";

export class ExperienceItem {
  @IsString()
  company!: string;

  @IsString()
  position!: string;

  @IsString()
  startYear!: string;

  @IsString()
  @IsOptional()
  endYear?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class EducationItem {
  @IsString()
  institution!: string;

  @IsString()
  degree!: string;

  @IsString()
  major!: string;

  @IsString()
  startYear!: string;

  @IsString()
  @IsOptional()
  endYear?: string;

  @IsString()
  @IsOptional()
  gpa?: string;
}

export class SaveCvDTO {
  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  portfolioUrl?: string;

  @IsOptional()
  @IsArray()
  experiences?: ExperienceItem[];

  @IsOptional()
  @IsArray()
  educations?: EducationItem[];

  @IsOptional()
  @IsArray()
  additionalSkills?: string[];
}
