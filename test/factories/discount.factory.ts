import { CreateDiscountDto } from "../../src/discount/dto/create-discount.dto";
import { Discount } from "../../src/discount/entities/discount.entity";
import { Rate } from "../../src/rate/entities/rate.entity";

export const buildCreateDiscountDto = (overrides = {}): CreateDiscountDto => {
  return {
    percentage: 10,
    startDate: new Date("2024-01-01"),
    endDate: null,
    rateId: 1,
    ...overrides,
  };
};

export const buildDiscount = (overrides = {}): Discount => {
  const discount = new Discount();
  discount.id = 1;
  discount.percentage = 10;
  discount.startDate = new Date("2024-01-01");
  discount.endDate = null;
  discount.startHour = 0;
  discount.endHour = 23;
  discount.rate = { id: 1 } as Rate;

  return Object.assign(discount, overrides);
};
