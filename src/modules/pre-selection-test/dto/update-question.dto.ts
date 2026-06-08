import {
  IsString,
  IsInt,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  Min,
  IsOptional,
} from "class-validator";
import { Type } from "class-transformer";

export class UpdateQuestionDTO {
  @IsOptional()
  @IsString()
  questionText?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  correctIndex?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
