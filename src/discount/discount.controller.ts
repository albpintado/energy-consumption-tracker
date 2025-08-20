import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DiscountService } from "./discount.service";
import { CreateDiscountDto } from "./dto/create-discount.dto";

@ApiTags("Discounts")
@Controller("discount")
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @ApiOperation({ summary: "Create a new discount" })
  @ApiResponse({ status: 201, description: "Discount created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDiscountDto: CreateDiscountDto) {
    return this.discountService.create(createDiscountDto);
  }

  @ApiOperation({ summary: "Activate a discount" })
  @ApiParam({ name: "id", description: "Discount ID" })
  @ApiResponse({ status: 200, description: "Discount activated successfully" })
  @ApiResponse({ status: 404, description: "Discount not found" })
  @Patch(":id")
  update(@Param("id") id: string) {
    return this.discountService.activate(+id);
  }

  @ApiOperation({ summary: "Deactivate a discount" })
  @ApiParam({ name: "id", description: "Discount ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: { endDate: { type: "string", format: "date", example: "2024-12-31" } },
    },
  })
  @ApiResponse({ status: 200, description: "Discount deactivated successfully" })
  @ApiResponse({ status: 404, description: "Discount not found" })
  @Delete(":id")
  deactivate(@Param("id") id: string, @Body("endDate") endDate: string) {
    return this.discountService.deactivate(+id, endDate);
  }
}
