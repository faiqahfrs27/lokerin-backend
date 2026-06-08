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

export class CreateQuestionDTO {
  @IsString()
  questionText!: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  options!: string[];

  @Type(() => Number)
  @IsInt()
  @Min(0)
  correctIndex!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  order?: number;
}
