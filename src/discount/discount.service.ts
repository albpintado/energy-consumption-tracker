import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rate } from "../rate/entities/rate.entity";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";
import { Discount } from "./entities/discount.entity";

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount) private discountRepository: Repository<Discount>
  ) {}

  create(createDiscountDto: CreateDiscountDto) {
    const { rateId, ...discountData } = createDiscountDto;
    const discount = this.discountRepository.create({
      ...discountData,
      rate: { id: rateId } as Rate,
    });

    return this.discountRepository.save(discount);
  }

  findAll() {
    return `This action returns all discount`;
  }

  findOne(id: number) {
    return `This action returns a #${id} discount`;
  }

  findByRate(rateId: number) {
    return this.discountRepository.findOne({
      where: { rate: { id: rateId } },
    });
  }

  update(id: number, updateDiscountDto: UpdateDiscountDto) {
    return `This action updates a #${id} discount`;
  }

  remove(id: number) {
    return `This action removes a #${id} discount`;
  }
}
