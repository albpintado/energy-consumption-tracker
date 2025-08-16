import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rate } from "../rate/entities/rate.entity";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { Discount } from "./entities/discount.entity";

@Injectable()
export class DiscountService {
  constructor(@InjectRepository(Discount) private discountRepository: Repository<Discount>) {}

  create(createDiscountDto: CreateDiscountDto) {
    const { rateId, ...discountData } = createDiscountDto;
    const discount = this.discountRepository.create({
      ...discountData,
      rate: { id: rateId } as Rate,
    });

    return this.discountRepository.save(discount);
  }

  findByRate(rateId: number) {
    return this.discountRepository.findOne({
      where: { rate: { id: rateId } },
    });
  }

  activate(id: number) {
    return this.discountRepository.update(id, { endDate: null });
  }

  deactivate(id: number, date: string) {
    return this.discountRepository.update(id, { endDate: new Date(date) });
  }
}
