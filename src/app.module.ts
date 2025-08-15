import { Module } from "@nestjs/common";
import { ConsumptionModule } from "./consumption/consumption.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Consumption } from "./consumption/entities/consumption.entity";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "postgres",
      password: "postgres",
      database: "energy-comsumption-tracker-dev",
      entities: [Consumption],
      synchronize: true,
    }),
    ConsumptionModule,
  ],
})
export class AppModule {}
