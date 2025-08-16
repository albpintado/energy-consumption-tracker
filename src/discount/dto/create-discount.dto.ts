import { IsNotEmpty, IsPositive } from "class-validator";

export class CreateDiscountDto {
  @IsNotEmpty()
  @IsPositive()
  percentage: number;

  @IsNotEmpty()
  startDate: Date;

  endDate: Date;

  @IsNotEmpty()
  rateId: number;
}
