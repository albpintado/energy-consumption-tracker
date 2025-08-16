import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DiscountService } from "src/discount/discount.service";
import { DateHelper } from "src/helpers/date.helper";
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

  getDailyConsumption(date: string) {
    return this.consumptionRepository.find({
      where: { date: new Date(date) },
    });
  }

  async getMonthlyConsumption(date: string) {
    const consumptions = await this.consumptionRepository.find({
      where: { date: new Date(date) },
    });

    const monthlyConsumption: number = consumptions.reduce((acc, curr) => {
      return acc + parseFloat(curr.energy.toString());
    }, 0);
    return { date, energy: monthlyConsumption };
  }

  async getExpenses(date: string) {
    const { startDate, endDate } = DateHelper.getMonthRange(date);

    const consumptions = await this.consumptionRepository.find({
      where: {
        date: Between(startDate, endDate),
      },
    });

    const periodsHours = {
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

    const rate = await this.rateService.findByName("Sun Club");
    const discount = await this.discountService.findByRate(rate.id);

    const expense = consumptions.reduce((acc, curr) => {
      // 1. Get period from current hour
      const currentHour = curr.hour;
      const period = Object.keys(periodsHours).find(period => {
        return periodsHours[period].some(range => {
          return currentHour >= range.start && currentHour < range.end;
        });
      });

      // 2. Multiply by period price
      const periodPrice =
        period === "peak"
          ? rate.peakEnergyPrice
          : period === "standard"
          ? rate.standardEnergyPrice
          : rate.offPeakEnergyPrice;
      const consumptionCost = curr.energy * periodPrice;

      // 3. Apply discount if applicable
      const finalCost = (consumptionCost * discount.percentage) / 100;

      // 4. Add to accumulator
      acc += finalCost;

      // 5. Return accumulator
      return acc;
    }, 0);

    // Get difference of days between startDate and endDate
    const invoiceDays =
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const peakPowerCost = 3.2 * (rate.peakPowerPrice || 0) * invoiceDays;
    const standardPowerCost =
      3.2 * (rate.standardPowerPrice || 0) * invoiceDays;
    const offPeakPowerCost = 3.2 * (rate.offPeakPowerPrice || 0) * invoiceDays;
    const powerCost = parseFloat(
      (peakPowerCost + standardPowerCost + offPeakPowerCost).toFixed(2)
    );

    const energyCost = parseFloat(expense.toFixed(2));

    return { date, energyCost, powerCost };
  }

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
