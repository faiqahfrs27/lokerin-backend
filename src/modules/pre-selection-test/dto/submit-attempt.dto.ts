import { IsArray, IsInt, IsUUID, Min, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class AnswerDTO {
  @IsUUID()
  questionId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  selectedIndex!: number;
}

export class SubmitAttemptDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDTO)
  answers!: AnswerDTO[];
}
