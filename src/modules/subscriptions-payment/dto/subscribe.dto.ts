import { IsUUID } from "class-validator";

export class SubscribeDTO {
  @IsUUID()
  planId!: string;
}
