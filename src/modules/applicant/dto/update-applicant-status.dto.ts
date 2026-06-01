import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class UpdateApplicantStatusDTO {
  @IsNotEmpty()
  @IsIn(["reviewed", "accepted", "rejected"])
  status!: "reviewed" | "accepted" | "rejected";

  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
