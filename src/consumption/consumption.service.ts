import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PeriodsPower } from "src/common/types/global";
import { DiscountService } from "src/discount/discount.service";
import { Discount } from "src/discount/entities/discount.entity";
import { DateHelper } from "src/helpers/date.helper";
import { EnergyPeriodsHelper } from "src/helpers/energy-periods.helper";
import { Rate } from "src/rate/entities/rate.entity";
import { RateService } from "src/rate/rate.service";
import { Between, Repository } from "typeorm";
import { CreateConsumptionDto } from "./dto/create-consumption.dto";
import { Consumption } from "./entities/consumption.entity";

@Injectable()
export class ConsumptionService {
  constructor(
    @InjectRepository(Consumption)
    private consumptionRepository: Repository<Consumption>,
    private rateService: RateService,
    private discountService: DiscountService
  ) {}

  async getDailyConsumption(date: string) {
    const consumptions = await this.consumptionRepository.find({
      where: { date: new Date(date) },
    });

    const dailyConsumption: number = consumptions.reduce((acc, curr) => {
      return acc + parseFloat(curr.energy.toString());
    }, 0);

    return { date, energy: parseFloat(dailyConsumption.toFixed(3)) };
  }

  async getMonthlyConsumption(date: string) {
    const { startDate, endDate } = DateHelper.getMonthRange(date);
    const month = DateHelper.getMonthName(startDate.getMonth());

    const consumptions = await this.consumptionRepository.find({
      where: { date: Between(startDate, endDate) },
    });

    const monthlyConsumption: number = consumptions.reduce((acc, curr) => {
      return acc + parseFloat(curr.energy.toString());
    }, 0);
    return { month, energy: parseFloat(monthlyConsumption.toFixed(3)) };
  }

  async getMonthlyCost(date: string) {
    const { startDate, endDate } = DateHelper.getMonthRange(date);
    const daysBetween = DateHelper.getDaysBetween(startDate, endDate);

    const consumptions = await this.consumptionRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
    });
    const contractedPower = { peak: 3.2, standard: 3.2, offPeak: 3.2 };

    const rate = await this.rateService.findByName("Sun Club");
    const discount = await this.discountService.findByRate(rate.id);
    const energyCost = this.getConsumptionTotalCost(consumptions, rate, discount);
    const powerCost = this.getPowerCost(contractedPower, rate, daysBetween);

    return { date, energyCost, powerCost };
  }

  private getConsumptionTotalCost = (
    consumptions: Consumption[],
    rate: Rate,
    discount: Discount
  ): number => {
    const rawCost = consumptions.reduce(
      (acc, consumption) => acc + this.getConsumptionAfterDiscountCost(consumption, rate, discount),
      0
    );

    return parseFloat(rawCost.toFixed(2));
  };

  private getConsumptionAfterDiscountCost = (
    consumption: Consumption,
    rate: Rate,
    discount: Discount
  ) => {
    const currentHour = consumption.hour;

    const period = EnergyPeriodsHelper.getPeriodByHour(currentHour);
    const periodPrice = this.getPeriodPrice(period, rate);

    const baseCost = consumption.energy * periodPrice;
    const discountCost = baseCost - (baseCost * discount.percentage) / 100;

    return baseCost - discountCost;
  };

  private getPeriodPrice = (period: string, rate: Rate): number => {
    switch (period) {
      case "peak":
        return rate.peakEnergyPrice;
      case "standard":
        return rate.standardEnergyPrice;
      case "offPeak":
        return rate.offPeakEnergyPrice;
      default:
        throw new Error(`Unknown period: ${period}`);
    }
  };

  private getPowerCost = (periodsPower: PeriodsPower, rate: Rate, daysBetween: number): number => {
    const peakPowerCost = this.getPeriodPowerCost(
      periodsPower.peak,
      rate.peakPowerPrice,
      daysBetween
    );
    const standardPowerCost = this.getPeriodPowerCost(
      periodsPower.standard,
      rate.standardPowerPrice,
      daysBetween
    );
    const offPeakPowerCost = this.getPeriodPowerCost(
      periodsPower.offPeak,
      rate.offPeakPowerPrice,
      daysBetween
    );

    return parseFloat((peakPowerCost + standardPowerCost + offPeakPowerCost).toFixed(2));
  };

  private getPeriodPowerCost = (
    power: number,
    periodPowerPrice: number,
    daysBetween: number
  ): number => {
    return power * (periodPowerPrice || 0) * daysBetween;
  };

  create(createConsumptionDto: CreateConsumptionDto) {
    const consumption = new Consumption();
    consumption.date = new Date(createConsumptionDto.date);
    consumption.hour = createConsumptionDto.hour;
    consumption.energy = createConsumptionDto.energy;

    return this.consumptionRepository.save(consumption);
  }

  createAll(consumptions: CreateConsumptionDto[]) {
    const entities: Consumption[] = consumptions.map(consumption => {
      const entity = new Consumption();
      entity.date = new Date(consumption.date);
      entity.hour = consumption.hour;
      entity.energy = consumption.energy;

      return entity;
    });

    return this.consumptionRepository.save(entities);
  }
}
