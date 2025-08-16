export type EnergyPeriod = "peak" | "standard" | "offPeak";

export type EnergyPeriodRange = {
  start: number;
  end: number;
};

export type EnergyPeriodObject = {
  [key in EnergyPeriod]: EnergyPeriodRange[];
};

export type PeriodsPower = {
  peak: number;
  standard: number;
  offPeak: number;
};
