import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { ConsumptionModule } from "./consumption/consumption.module";
import { Consumption } from "./consumption/entities/consumption.entity";
import { ContractModule } from "./contract/contract.module";
import { Contract } from "./contract/entities/contract.entity";
import { DiscountModule } from "./discount/discount.module";
import { Discount } from "./discount/entities/discount.entity";
import { Rate } from "./rate/entities/rate.entity";
import { RateModule } from "./rate/rate.module";
import { User } from "./user/entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "energy-comsumption-tracker-dev",
      entities: [User, Contract, Consumption, Rate, Discount],
      synchronize: true,
    }),
    AuthModule,
    ContractModule,
    ConsumptionModule,
    RateModule,
    DiscountModule,
  ],
})
export class AppModule {}
