import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { ConsumptionService } from "./consumption.service";
import { CreateConsumptionDto } from "./dto/create-consumption.dto";

@Controller("consumption")
export class ConsumptionController {
  constructor(private readonly consumptionService: ConsumptionService) {}

  @Post()
  @HttpCode(201)
  create(@Body() createConsumptionDto: CreateConsumptionDto) {
    return this.consumptionService.create(createConsumptionDto);
  }

  @Post("/all")
  @HttpCode(201)
  createAll(@Body() consumptions: CreateConsumptionDto[]) {
    return this.consumptionService.createAll(consumptions);
  }
}
