import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateRateDto } from "./dto/create-rate.dto";
import { UpdateRateDto } from "./dto/update-rate.dto";
import { Rate } from "./entities/rate.entity";

@Injectable()
export class RateService {
  constructor(
    @InjectRepository(Rate)
    private rateRepository: Repository<Rate>
  ) {}

  create(createRateDto: CreateRateDto) {
    const rate = this.rateRepository.create(createRateDto);
    return this.rateRepository.save(rate);
  }

  findAll() {
    return this.rateRepository.find();
  }

  findOne(id: number) {
    return this.rateRepository.findOneBy({ id });
  }

  findByName(name: string) {
    return this.rateRepository.findOne({ where: { name } });
  }

  update(id: number, updateRateDto: UpdateRateDto) {
    return this.rateRepository.update(id, updateRateDto);
  }

  activate(id: number) {
    return this.rateRepository.update(id, { endDate: null });
  }

  deactivate(id: number, endDate: string) {
    return this.rateRepository.update(id, { endDate: new Date(endDate) });
  }
}
