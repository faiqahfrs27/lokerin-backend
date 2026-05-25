import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

export class UpdateSubscriptionPlanDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  features?: string[];
}