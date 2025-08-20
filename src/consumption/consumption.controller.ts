import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../user/entities/user.entity";
import { ConsumptionService } from "./consumption.service";
import { CreateConsumptionDto } from "./dto/create-consumption.dto";

@Controller("consumption")
@UseGuards(JwtAuthGuard)
export class ConsumptionController {
  constructor(private readonly consumptionService: ConsumptionService) {}

  @Get("/daily/:contractId/:date")
  getDailyConsumption(
    @Param("contractId") contractId: string,
    @Param("date") date: string,
    @CurrentUser() user: User
  ) {
    return this.consumptionService.getDailyConsumption(date, +contractId, user.id);
  }

  @Get("/monthly/:contractId/:date")
  getMonthlyConsumption(
    @Param("contractId") contractId: string,
    @Param("date") date: string,
    @CurrentUser() user: User
  ) {
    return this.consumptionService.getMonthlyConsumption(date, +contractId, user.id);
  }

  @Get("/expenses/:contractId/:date/monthly")
  getMonthlyCost(
    @Param("contractId") contractId: string,
    @Param("date") date: string,
    @CurrentUser() user: User
  ) {
    return this.consumptionService.getMonthlyCost(date, +contractId, user.id);
  }

  @Get("/expenses/:contractId/:date/days-month")
  getDaysOfMonthCost(
    @Param("contractId") contractId: string,
    @Param("date") date: string,
    @CurrentUser() user: User
  ) {
    return this.consumptionService.getDaysOfMonthCost(date, +contractId, user.id);
  }

  @Post("/:contractId")
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param("contractId") contractId: string,
    @Body() createConsumptionDto: CreateConsumptionDto,
    @CurrentUser() user: User
  ) {
    return this.consumptionService.create(createConsumptionDto, +contractId, user.id);
  }

  @Post("/:contractId/all")
  @HttpCode(HttpStatus.CREATED)
  createAll(
    @Param("contractId") contractId: string,
    @Body() consumptions: CreateConsumptionDto[],
    @CurrentUser() user: User
  ) {
    return this.consumptionService.createAll(consumptions, +contractId, user.id);
  }
}
