import { IsEmail, IsString } from "class-validator";

export class UpdateEmailDTO {
  @IsEmail()
  newEmail!: string;

  @IsString()
  password!: string;
}
