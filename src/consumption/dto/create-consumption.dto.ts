import { IsNotEmpty, IsPositive } from "class-validator";

export class CreateConsumptionDto {
  @IsNotEmpty()
  date: string;

  @IsNotEmpty()
  hour: number;

  @IsNotEmpty()
  @IsPositive()
  energy: number;
}
