import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from "class-validator";

export class CreateQuestionDTO {
  @IsNotEmpty()
  @IsString()
  question!: string;

  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  options!: string[];

  @IsInt()
  @Min(0)
  correctIndex!: number;
}
