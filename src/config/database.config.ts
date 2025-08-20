import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Consumption } from "../consumption/entities/consumption.entity";
import { Contract } from "../contract/entities/contract.entity";
import { Discount } from "../discount/entities/discount.entity";
import { Rate } from "../rate/entities/rate.entity";
import { User } from "../user/entities/user.entity";

export default registerAs(
  "database",
  (): TypeOrmModuleOptions => ({
    type: "postgres",
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || "postgres",
    password: process.env.DATABASE_PASSWORD || "postgres",
    database: process.env.DATABASE_NAME || "energy-comsumption-tracker-dev",
    entities: [User, Contract, Consumption, Rate, Discount],
    synchronize: process.env.NODE_ENV !== "production",
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    logging: process.env.NODE_ENV === "development",
  })
);
