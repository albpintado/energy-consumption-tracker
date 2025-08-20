import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class CreateConsumptionDto {
  @IsNotEmpty()
  date: string;

  @IsNotEmpty()
  hour: number;

  @IsNotEmpty()
  @IsPositive()
  energy: number;

  @IsNumber()
  @IsNotEmpty()
  contractId: number;
}
