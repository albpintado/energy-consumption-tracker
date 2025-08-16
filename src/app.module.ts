import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConsumptionModule } from "./consumption/consumption.module";
import { Consumption } from "./consumption/entities/consumption.entity";
import { DiscountModule } from "./discount/discount.module";
import { Discount } from "./discount/entities/discount.entity";
import { Rate } from "./rate/entities/rate.entity";
import { RateModule } from "./rate/rate.module";
import { ExpenseModule } from './expense/expense.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "energy-comsumption-tracker-dev",
      entities: [Consumption, Rate, Discount],
      synchronize: true,
    }),
    ConsumptionModule,
    RateModule,
    DiscountModule,
    ExpenseModule,
  ],
})
export class AppModule {}
