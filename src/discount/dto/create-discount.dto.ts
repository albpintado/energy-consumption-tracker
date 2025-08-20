import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsPositive } from "class-validator";

export class CreateDiscountDto {
  @ApiProperty({ example: 15.5, description: "Discount percentage" })
  @IsNotEmpty()
  @IsPositive()
  percentage: number;

  @ApiProperty({ example: "2024-01-01", description: "Discount start date" })
  @IsNotEmpty()
  startDate: Date;

  @ApiPropertyOptional({ example: "2024-12-31", description: "Discount end date" })
  endDate: Date;

  @ApiProperty({ example: 1, description: "Rate ID to apply discount to" })
  @IsNotEmpty()
  rateId: number;
}
