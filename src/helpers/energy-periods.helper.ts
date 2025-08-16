import {
  EnergyPeriod,
  EnergyPeriodObject,
  EnergyPeriodRange,
} from "src/common/types/global";

export class EnergyPeriodsHelper {
  static getPeriods = (): EnergyPeriodObject => {
    return {
      peak: [
        {
          start: 10,
          end: 14,
        },
        {
          start: 16,
          end: 22,
        },
      ],
      standard: [
        {
          start: 8,
          end: 10,
        },
        {
          start: 14,
          end: 16,
        },
        {
          start: 22,
          end: 0,
        },
      ],
      offPeak: [
        {
          start: 0,
          end: 8,
        },
      ],
    };
  };

  static getPeriodByHour = (hour: number): EnergyPeriod | undefined => {
    const periods = EnergyPeriodsHelper.getPeriods();

    for (const [periodName, ranges] of Object.entries(periods)) {
      if (ranges.some(range => this.isHourInRange(hour, range))) {
        return periodName as EnergyPeriod;
      }
    }

    return undefined;
  };

  private static isHourInRange(
    hour: number,
    range: EnergyPeriodRange
  ): boolean {
    if (range.end === 0) {
      return hour >= range.start;
    }
    return hour >= range.start && hour < range.end;
  }
}
