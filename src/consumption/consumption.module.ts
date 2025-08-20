import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ContractModule } from "../contract/contract.module";
import { DiscountService } from "../discount/discount.service";
import { Discount } from "../discount/entities/discount.entity";
import { Rate } from "../rate/entities/rate.entity";
import { RateService } from "../rate/rate.service";
import { ConsumptionController } from "./consumption.controller";
import { ConsumptionService } from "./consumption.service";
import { Consumption } from "./entities/consumption.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Consumption, Rate, Discount]), ContractModule],
  controllers: [ConsumptionController],
  providers: [ConsumptionService, RateService, DiscountService],
  exports: [TypeOrmModule],
})
export class ConsumptionModule {}
