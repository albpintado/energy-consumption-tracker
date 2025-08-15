import { Module } from "@nestjs/common";
import { ConsumptionService } from "./consumption.service";
import { ConsumptionController } from "./consumption.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Consumption } from "./entities/consumption.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Consumption])],
  controllers: [ConsumptionController],
  providers: [ConsumptionService],
  exports: [TypeOrmModule],
})
export class ConsumptionModule {}
