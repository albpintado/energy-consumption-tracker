import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { DiscountService } from "./discount.service";
import { CreateDiscountDto } from "./dto/create-discount.dto";

@Controller("discount")
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create(createDiscountDto);
  }

  @Patch(":id")
  update(@Param("id") id: string) {
    return this.discountService.activate(+id);
  }

  @Delete(":id")
  deactivate(@Param("id") id: string, @Body("endDate") endDate: string) {
    return this.discountService.deactivate(+id, endDate);
  }
}
