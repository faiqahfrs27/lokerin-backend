import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateJobCategoryDTO {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name!: string;
}
