import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from "class-validator";

export class CreateSubscriptionPlanDTO {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  price!: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  features!: string[];
}