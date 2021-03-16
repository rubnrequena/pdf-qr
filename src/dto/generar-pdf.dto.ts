import { IsNotEmpty } from "class-validator";

export class GenerarPDF {
  @IsNotEmpty()
  readonly pdf: string;
}