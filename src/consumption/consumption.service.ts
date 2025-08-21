import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, Repository } from "typeorm";
import { PeriodsPower } from "../common/types/global";
import { Contract } from "../contract/entities/contract.entity";
import { ContractService } from "../contract/contract.service";
import { DiscountService } from "../discount/discount.service";
import { Discount } from "../discount/entities/discount.entity";
import { DateHelper } from "../helpers/date.helper";
import { EnergyPeriodsHelper } from "../helpers/energy-periods.helper";
import { Rate } from "../rate/entities/rate.entity";
import { RateService } from "../rate/rate.service";
import { CreateConsumptionDto } from "./dto/create-consumption.dto";
import {
  DashboardIndicatorsResponseDto,
  MonthlyIndicatorsDto,
} from "./dto/dashboard-indicators.dto";
import { DailyHourlyConsumptionResponseDto } from "./dto/hourly-consumption.dto";
import { Consumption } from "./entities/consumption.entity";

@Injectable()
export class ConsumptionService {
  constructor(
    @InjectRepository(Consumption)
    private consumptionRepository: Repository<Consumption>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    private contractService: ContractService,
    private rateService: RateService,
    private discountService: DiscountService
  ) {}

  async getDailyConsumption(date: string, contractId: number, userId: number) {
    await this.contractService.validateContractOwnership(contractId, userId);

    const consumptions = await this.consumptionRepository.find({
      where: {
        date: new Date(date),
        contract: { id: contractId },
      },
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

  async getDailyHourlyConsumption(
    date: string,
    contractId: number,
    userId: number
  ): Promise<DailyHourlyConsumptionResponseDto> {
    await this.contractService.validateContractOwnership(contractId, userId);

    const consumptions = await this.consumptionRepository.find({
      where: {
        date: new Date(date),
        contract: { id: contractId },
      },
      order: {
        hour: "ASC",
      },
    });

    if (consumptions.length === 0) {
      throw new NotFoundException("No consumption data found for the specified date");
    }

    const hourlyConsumption = consumptions.map(consumption => {
      if (!consumption.energy || isNaN(consumption.energy)) {
        throw new BadRequestException("Invalid energy value in consumption data");
      }

      return {
        hour: consumption.hour,
        energy: parseFloat(consumption.energy.toString()),
      };
    });

    return {
      date,
      hourlyConsumption,
    };
  }

  async getDashboardIndicators(userId: number): Promise<DashboardIndicatorsResponseDto> {
    const now = new Date();
    
    // Format dates as YYYY-MM-DD strings (same format as the working endpoint)
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthStr = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, '0')}-01`;

    const currentMonthIndicators = await this.getMonthlyIndicators(userId, currentMonthStr);
    const previousMonthIndicators = await this.getMonthlyIndicators(userId, previousMonthStr);

    return {
      currentMonth: currentMonthIndicators,
      previousMonth: previousMonthIndicators,
    };
  }

  private async getMonthlyIndicators(
    userId: number,
    monthDateStr: string
  ): Promise<MonthlyIndicatorsDto> {
    const { startDate, endDate } = DateHelper.getMonthRange(monthDateStr);
    
    console.log(`[DEBUG] Dashboard indicators - monthDateStr: ${monthDateStr}, startDate: ${startDate.toISOString()}, endDate: ${endDate.toISOString()}`);

    // Get ALL contracts (both active and inactive) for total count
    const allUserContracts = await this.contractRepository.find({
      where: { user: { id: userId } },
      relations: ["rate", "rate.discounts"],
      order: { createdAt: "DESC" },
    });

    const totalContracts = allUserContracts.length;
    const activeContracts = allUserContracts.filter(contract => contract.isActive).length;

    if (totalContracts === 0) {
      return {
        totalContracts: 0,
        activeContracts: 0,
        totalKwhConsumed: 0,
        totalCost: 0,
      };
    }

    let totalKwhConsumed = 0;
    let totalCost = 0;

    // Process all contracts that have consumption data for the period
    for (const contract of allUserContracts) {
      const consumptions = await this.consumptionRepository.find({
        where: {
          date: Between(startDate, endDate),
          contract: { id: contract.id },
        },
      });

      console.log(`[DEBUG] Contract ${contract.id}: found ${consumptions.length} consumptions for date range`);

      if (consumptions.length > 0) {
        const contractKwh = consumptions.reduce((acc, consumption) => {
          if (!consumption.energy || isNaN(consumption.energy)) {
            return acc;
          }
          return acc + parseFloat(consumption.energy.toString());
        }, 0);

        totalKwhConsumed += contractKwh;

        // Only calculate cost if contract has rate information
        if (contract.rate) {
          const rate = contract.rate;
          const discount = contract.rate.discounts?.[0] || null;
          const contractCost = this.getConsumptionTotalCost(consumptions, rate, discount);

          const daysBetween = DateHelper.getDaysBetween(startDate, endDate);
          const contractedPower = { peak: 3.2, standard: 3.2, offPeak: 3.2 };
          const powerCost = this.getPowerCost(contractedPower, rate, daysBetween);

          totalCost += contractCost + powerCost;
        }
      }
    }

    console.log(`[DEBUG] Final dashboard totals - totalKwhConsumed: ${totalKwhConsumed}, totalCost: ${totalCost}`);

    return {
      totalContracts,
      activeContracts,
      totalKwhConsumed: parseFloat(totalKwhConsumed.toFixed(3)),
      totalCost: parseFloat(totalCost.toFixed(2)),
    };
  }

  async getMonthlyConsumption(date: string, contractId: number, userId: number) {
    await this.contractService.validateContractOwnership(contractId, userId);
    const { startDate, endDate } = DateHelper.getMonthRange(date);

    if (!DateHelper.isValidDate(startDate) || !DateHelper.isValidDate(endDate)) {
      throw new BadRequestException();
    }

    const month = DateHelper.getMonthName(startDate.getMonth());

    const consumptions = await this.consumptionRepository.find({
      where: {
        date: Between(startDate, endDate),
        contract: { id: contractId },
      },
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

  async getDaysOfMonthCost(date: string, contractId: number, userId: number) {
    await this.contractService.validateContractOwnership(contractId, userId);
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
        contract: { id: contractId },
      },
    });

    if (consumptions.length === 0) {
      throw new NotFoundException();
    }

    const contract = await this.contractService.findOne(contractId, userId);
    const rate = contract.rate;
    const discount = contract.rate.discounts[0] || null;

    const energyCost = Object.values(
      consumptions.reduce(
        (acc, { date, energy }) => {
          acc[date.toString()] = acc[date.toString()] || { date, energy: 0 };
          const newValue = acc[date.toString()].energy + +energy;
          const newEnergy = Math.round(newValue * 1000) / 1000;
          acc[date.toString()].energy = newEnergy;
          return acc;
        },
        {} as { date: string; energy: number }[]
      )
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

  async getMonthlyCost(date: string, contractId: number, userId: number) {
    await this.contractService.validateContractOwnership(contractId, userId);
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
        contract: { id: contractId },
      },
    });

    if (consumptions.length === 0) {
      throw new NotFoundException();
    }

    const contract = await this.contractService.findOne(contractId, userId);
    const rate = contract.rate;
    const discount = contract.rate.discounts[0] || null;
    const energyCost = this.getConsumptionTotalCost(consumptions, rate, discount);

    const contractedPower = { peak: 3.2, standard: 3.2, offPeak: 3.2 };
    const powerCost = this.getPowerCost(contractedPower, rate, daysBetween);

    const totalCost = parseFloat((energyCost + powerCost).toFixed(2));

    return { date, energyCost, powerCost, totalCost };
  }

  private getConsumptionTotalCost = (
    consumptions: Consumption[],
    rate: Rate,
    discount: Discount | null
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
    discount: Discount | null
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

    if (!discount) {
      return baseCost;
    }

    const discountCost = (baseCost * discount.percentage) / 100;

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

  async create(createConsumptionDto: CreateConsumptionDto, contractId: number, userId: number) {
    await this.contractService.validateContractOwnership(contractId, userId);

    const consumption = this.consumptionRepository.create({
      ...createConsumptionDto,
      contract: { id: contractId },
    });

    return this.consumptionRepository.save(consumption);
  }

  async createAll(consumptions: CreateConsumptionDto[], contractId: number, userId: number) {
    await this.contractService.validateContractOwnership(contractId, userId);

    const entities: Consumption[] = consumptions.map(consumption => {
      this.deleteExistentConsumptions(consumption, contractId);

      return this.consumptionRepository.create({
        ...consumption,
        contract: { id: contractId },
      });
    });

    return this.consumptionRepository.save(entities);
  }

  private deleteExistentConsumptions(consumption: CreateConsumptionDto, contractId: number) {
    if (!consumption.date || consumption.hour === null || consumption.energy === null) {
      throw new BadRequestException("Invalid consumption data");
    }
    const date = new Date(consumption.date);

    if (!DateHelper.isValidDate(date)) {
      throw new BadRequestException("Invalid date");
    }

    this.consumptionRepository.delete({
      date,
      hour: consumption.hour,
      contract: { id: contractId },
    });
  }
}
