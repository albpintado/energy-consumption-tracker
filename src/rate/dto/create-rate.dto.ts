import { IsNotEmpty, IsPositive } from "class-validator";

export class CreateRateDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsPositive()
  peakEnergyPrice: number;

  @IsNotEmpty()
  @IsPositive()
  standardEnergyPrice: number;

  @IsNotEmpty()
  @IsPositive()
  offPeakEnergyPrice: number;

  peakPowerPrice: number;

  standardPowerPrice: number;

  offPeakPowerPrice: number;

  @IsNotEmpty()
  startDate: Date;

  endDate: Date;
}
