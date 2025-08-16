import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DiscountService } from "src/discount/discount.service";
import { Discount } from "src/discount/entities/discount.entity";
import { Rate } from "src/rate/entities/rate.entity";
import { RateService } from "src/rate/rate.service";
import { ConsumptionController } from "./consumption.controller";
import { ConsumptionService } from "./consumption.service";
import { Consumption } from "./entities/consumption.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Consumption, Rate, Discount])],
  controllers: [ConsumptionController],
  providers: [ConsumptionService, RateService, DiscountService],
  exports: [TypeOrmModule],
})
export class ConsumptionModule {}
