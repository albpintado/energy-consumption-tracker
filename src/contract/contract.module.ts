import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Rate } from "../rate/entities/rate.entity";
import { ContractController } from "./contract.controller";
import { ContractService } from "./contract.service";
import { Contract } from "./entities/contract.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Rate])],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
