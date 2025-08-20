import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";

export class CreateConsumptionDto {
  @ApiProperty({ example: "2024-01-15", description: "Date of consumption" })
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 14, description: "Hour of the day (0-23)" })
  @IsNotEmpty()
  hour: number;

  @ApiProperty({ example: 2.5, description: "Energy consumed in kWh" })
  @IsNotEmpty()
  @IsPositive()
  energy: number;

  @ApiProperty({ example: 1, description: "Contract ID" })
  @IsNumber()
  @IsNotEmpty()
  contractId: number;
}
