import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import appConfig from "./config/app.config";
import databaseConfig from "./config/database.config";
import { ConsumptionModule } from "./consumption/consumption.module";
import { ContractModule } from "./contract/contract.module";
import { DiscountModule } from "./discount/discount.module";
import { HealthModule } from "./health/health.module";
import { RateModule } from "./rate/rate.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: [`.env.${process.env.NODE_ENV || "development"}`, ".env"],
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get("database"),
    }),
    AuthModule,
    ContractModule,
    ConsumptionModule,
    RateModule,
    DiscountModule,
    HealthModule,
  ],
})
export class AppModule {}
