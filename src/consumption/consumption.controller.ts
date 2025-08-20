import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ConsumptionService } from "./consumption.service";
import { CreateConsumptionDto } from "./dto/create-consumption.dto";

@Controller("consumption")
export class ConsumptionController {
  constructor(private readonly consumptionService: ConsumptionService) {}

  @Get("/daily/:date")
  getDailyConsumption(@Param("date") date: string) {
    return this.consumptionService.getDailyConsumption(date);
  }

  @Get("/monthly/:date")
  getMonthlyConsumption(@Param("date") date: string) {
    return this.consumptionService.getMonthlyConsumption(date);
  }

  @Get("/expenses/:date/monthly")
  getMonthlyCost(@Param("date") date: string) {
    return this.consumptionService.getMonthlyCost(date);
  }

  @Get("/expenses/:date/days-month")
  getDaysOfMonthCost(@Param("date") date: string) {
    return this.consumptionService.getDaysOfMonthCost(date);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createConsumptionDto: CreateConsumptionDto) {
    return this.consumptionService.create(createConsumptionDto);
  }

  @Post("/all")
  @HttpCode(HttpStatus.CREATED)
  createAll(@Body() consumptions: CreateConsumptionDto[]) {
    return this.consumptionService.createAll(consumptions);
  }
}
