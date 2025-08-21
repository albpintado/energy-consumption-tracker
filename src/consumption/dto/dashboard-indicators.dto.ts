import { ApiProperty } from "@nestjs/swagger";

export class MonthlyIndicatorsDto {
  @ApiProperty({ example: 5, description: "Total number of contracts" })
  totalContracts: number;

  @ApiProperty({ example: 4, description: "Number of active contracts" })
  activeContracts: number;

  @ApiProperty({ example: 1250.75, description: "Total energy consumed in kWh" })
  totalKwhConsumed: number;

  @ApiProperty({ example: 187.35, description: "Total cost in euros" })
  totalCost: number;
}

export class DashboardIndicatorsResponseDto {
  @ApiProperty({
    type: MonthlyIndicatorsDto,
    description: "Indicators for current month",
  })
  currentMonth: MonthlyIndicatorsDto;

  @ApiProperty({
    type: MonthlyIndicatorsDto,
    description: "Indicators for previous month",
  })
  previousMonth: MonthlyIndicatorsDto;
}
