import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateConsumptionDto } from "./dto/create-consumption.dto";
import { Consumption } from "./entities/consumption.entity";

@Injectable()
export class ConsumptionService {
  constructor(
    @InjectRepository(Consumption)
    private consumptionRepository: Repository<Consumption>
  ) {}

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
