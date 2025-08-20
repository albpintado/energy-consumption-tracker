import { Rate } from "../../src/rate/entities/rate.entity";

export const buildCreateRateDto = (overrides = {}) => {
  return {
    name: "New Rate",
    peakEnergyPrice: 0.3,
    standardEnergyPrice: 0.2,
    offPeakEnergyPrice: 0.1,
    peakPowerPrice: 0.4,
    standardPowerPrice: 0.2,
    offPeakPowerPrice: null,
    startDate: new Date(),
    endDate: null,
    ...overrides,
  };
};

export const buildUpdateRateDto = (overrides = {}) => {
  return {
    name: "Updated Rate",
    peakEnergyPrice: 0.35,
    standardEnergyPrice: 0.25,
    offPeakEnergyPrice: 0.15,
    ...overrides,
  };
};

export const buildRate = (overrides = {}): Rate => {
  const rate = new Rate();
  rate.id = 1;
  rate.name = "Test Rate";
  rate.peakEnergyPrice = 0.3;
  rate.standardEnergyPrice = 0.2;
  rate.offPeakEnergyPrice = 0.1;
  rate.peakPowerPrice = 0.4;
  rate.standardPowerPrice = 0.2;
  rate.offPeakPowerPrice = null;
  rate.startDate = new Date();
  rate.endDate = null;
  
  return Object.assign(rate, overrides);
};
