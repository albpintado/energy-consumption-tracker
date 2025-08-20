import { CreateConsumptionDto } from "../../src/consumption/dto/create-consumption.dto";
import { Consumption } from "../../src/consumption/entities/consumption.entity";

export const buildCreateConsumptionDto = (overrides = {}): CreateConsumptionDto => {
  return {
    date: "2024-01-15",
    hour: 12,
    energy: 1.5,
    ...overrides,
  };
};

export const buildConsumption = (overrides = {}): Consumption => {
  const consumption = new Consumption();
  consumption.id = 1;
  consumption.date = new Date("2024-01-15");
  consumption.hour = 12;
  consumption.energy = 1.5;
  consumption.createdAt = new Date();
  consumption.updatedAt = new Date();
  consumption.deletedAt = null;

  return Object.assign(consumption, overrides);
};
