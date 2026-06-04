import { IsObject, IsDefined } from "class-validator";

export class SubmitAnswersDTO {
  @IsDefined({ message: "answers is required" })
  @IsObject({ message: "answers must be an object" })
  answers!: Record<string, number>;
}
