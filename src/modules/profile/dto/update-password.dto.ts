import { IsString, MinLength } from "class-validator";

export class UpdatePasswordDTO {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
