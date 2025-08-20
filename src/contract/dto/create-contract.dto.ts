import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateContractDto {
  @ApiProperty({ example: "CONT-2024-001", description: "Unique contract number" })
  @IsString()
  @IsNotEmpty()
  contractNumber: string;

  @ApiProperty({ example: "Energy Company Ltd", description: "Energy supplier name" })
  @IsString()
  @IsNotEmpty()
  supplierName: string;

  @ApiProperty({ example: "2024-01-01", description: "Contract start date" })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiPropertyOptional({ example: "2024-12-31", description: "Contract end date" })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 1, description: "Rate ID to use for this contract" })
  @IsNumber()
  @IsNotEmpty()
  rateId: number;
}
