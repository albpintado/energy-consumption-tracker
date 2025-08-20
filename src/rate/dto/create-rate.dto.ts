import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsPositive } from "class-validator";

export class CreateRateDto {
  @ApiProperty({ example: "Standard Rate 2024", description: "Rate name" })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 0.25, description: "Peak energy price per kWh" })
  @IsNotEmpty()
  @IsPositive()
  peakEnergyPrice: number;

  @ApiProperty({ example: 0.2, description: "Standard energy price per kWh" })
  @IsNotEmpty()
  @IsPositive()
  standardEnergyPrice: number;

  @ApiProperty({ example: 0.15, description: "Off-peak energy price per kWh" })
  @IsNotEmpty()
  @IsPositive()
  offPeakEnergyPrice: number;

  @ApiPropertyOptional({ example: 0.05, description: "Peak power price per kW" })
  peakPowerPrice: number;

  @ApiPropertyOptional({ example: 0.04, description: "Standard power price per kW" })
  standardPowerPrice: number;

  @ApiPropertyOptional({ example: 0.03, description: "Off-peak power price per kW" })
  offPeakPowerPrice: number;

  @ApiProperty({ example: "2024-01-01", description: "Rate start date" })
  @IsNotEmpty()
  startDate: Date;

  @ApiPropertyOptional({ example: "2024-12-31", description: "Rate end date" })
  endDate: Date;
}
