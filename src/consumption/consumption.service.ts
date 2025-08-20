import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
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

    if (consumptions.length === 0) {
      throw new NotFoundException();
    }

    const dailyConsumption: number = consumptions.reduce((acc, consumption) => {
      if (!consumption.energy || isNaN(consumption.energy)) {
        throw new BadRequestException("Invalid energy value in consumption data");
      }

      return acc + parseFloat(consumption.energy.toString());
    }, 0);

    return { date, energy: parseFloat(dailyConsumption.toFixed(3)) };
  }

  async getMonthlyConsumption(date: string) {
    const { startDate, endDate } = DateHelper.getMonthRange(date);

    if (!DateHelper.isValidDate(startDate) || !DateHelper.isValidDate(endDate)) {
      throw new BadRequestException();
    }

    const month = DateHelper.getMonthName(startDate.getMonth());

    const consumptions = await this.consumptionRepository.find({
      where: { date: Between(startDate, endDate) },
    });

    if (consumptions.length === 0) {
      throw new NotFoundException();
    }

    const monthlyConsumption: number = consumptions.reduce((acc, consumption) => {
      if (!consumption.energy || isNaN(consumption.energy)) {
        throw new BadRequestException("Invalid energy value in consumption data");
      }

      return acc + parseFloat(consumption.energy.toString());
    }, 0);
    return { month, energy: parseFloat(monthlyConsumption.toFixed(3)) };
  }

  async getDaysOfMonthCost(date: string) {
    const { startDate, endDate } = DateHelper.getMonthRange(date);

    if (!DateHelper.isValidDate(startDate) || !DateHelper.isValidDate(endDate)) {
      throw new BadRequestException("Invalid date range");
    }

    const daysBetween = DateHelper.getDaysBetween(startDate, endDate);

    if (daysBetween < 0) {
      throw new BadRequestException("Invalid date range");
    }

    const consumptions = await this.consumptionRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
    });

    if (consumptions.length === 0) {
      throw new NotFoundException();
    }

    const rate = await this.rateService.findByName("Sun Club");
    const discount = await this.discountService.findByRate(rate.id);

    const energyCost = Object.values(
      consumptions.reduce((acc, { date, energy }) => {
        acc[date.toString()] = acc[date.toString()] || { date, energy: 0 };
        const newValue = acc[date.toString()].energy + +energy;
        const newEnergy = Math.round(newValue * 1000) / 1000;
        acc[date.toString()].energy = newEnergy;
        return acc;
      }, {} as { date: string; energy: number }[])
    );

    for (let i = 1; i <= daysBetween + 1; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const found = energyCost.find(item => item.date === currentDate.toISOString().split("T")[0]);
      if (!found) {
        energyCost.push({ date: currentDate.toISOString().split("T")[0], energy: null });
      }
    }

    return energyCost.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async getMonthlyCost(date: string) {
    const { startDate, endDate } = DateHelper.getMonthRange(date);

    if (!DateHelper.isValidDate(startDate) || !DateHelper.isValidDate(endDate)) {
      throw new BadRequestException("Invalid date range");
    }

    const daysBetween = DateHelper.getDaysBetween(startDate, endDate);

    if (daysBetween < 0) {
      throw new BadRequestException("Invalid date range");
    }

    const consumptions = await this.consumptionRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
    });

    if (consumptions.length === 0) {
      throw new NotFoundException();
    }

    const rate = await this.rateService.findByName("Sun Club");
    const discount = await this.discountService.findByRate(rate.id);
    const energyCost = this.getConsumptionTotalCost(consumptions, rate, discount);

    const contractedPower = { peak: 3.2, standard: 3.2, offPeak: 3.2 };
    const powerCost = this.getPowerCost(contractedPower, rate, daysBetween);

    const totalCost = parseFloat((energyCost + powerCost).toFixed(2));

    return { date, energyCost, powerCost, totalCost };
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
    if (!consumption.energy || isNaN(consumption.energy)) {
      throw new BadRequestException("Invalid energy value in consumption data");
    }

    const currentHour = consumption.hour;

    const period = EnergyPeriodsHelper.getPeriodByHour(currentHour);

    if (!period) {
      throw new BadRequestException("Invalid period");
    }

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
        throw new BadRequestException(`Unknown period: ${period}`);
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

    if (isNaN(peakPowerCost) || isNaN(standardPowerCost) || isNaN(offPeakPowerCost)) {
      throw new BadRequestException("Invalid power cost values");
    }

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
    const consumption = this.consumptionRepository.create(createConsumptionDto);

    return this.consumptionRepository.save(consumption);
  }

  createAll(consumptions: CreateConsumptionDto[]) {
    const entities: Consumption[] = consumptions.map(consumption => {
      this.deleteExistentConsumptions(consumption);

      return this.consumptionRepository.create(consumption);
    });

    return this.consumptionRepository.save(entities);
  }

  private deleteExistentConsumptions(consumption: CreateConsumptionDto) {
    if (!consumption.date || consumption.hour == null || consumption.energy == null) {
      throw new BadRequestException("Invalid consumption data");
    }
    const date = new Date(consumption.date);

    if (!DateHelper.isValidDate(date)) {
      throw new BadRequestException("Invalid date");
    }

    this.consumptionRepository.delete({ date, hour: consumption.hour });
  }
}
