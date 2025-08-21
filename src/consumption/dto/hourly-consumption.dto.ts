import { ApiProperty } from "@nestjs/swagger";

export class HourlyConsumptionDto {
  @ApiProperty({ example: 14, description: "Hour of the day (0-23)" })
  hour: number;

  @ApiProperty({ example: 2.5, description: "Energy consumed in kWh" })
  energy: number;
}

export class DailyHourlyConsumptionResponseDto {
  @ApiProperty({ example: "2024-01-15", description: "Date of consumption" })
  date: string;

  @ApiProperty({
    type: [HourlyConsumptionDto],
    description: "Hourly consumption data for the day",
  })
  hourlyConsumption: HourlyConsumptionDto[];
}
