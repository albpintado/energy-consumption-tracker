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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../user/entities/user.entity";
import { ConsumptionService } from "./consumption.service";
import { CreateConsumptionDto } from "./dto/create-consumption.dto";

@ApiTags("Consumption")
@ApiBearerAuth()
@Controller("consumption")
@UseGuards(JwtAuthGuard)
export class ConsumptionController {
  constructor(private readonly consumptionService: ConsumptionService) {}

  @ApiOperation({ summary: "Get daily consumption for a contract" })
  @ApiParam({ name: "contractId", description: "Contract ID" })
  @ApiParam({ name: "date", description: "Date in YYYY-MM-DD format" })
  @ApiResponse({ status: 200, description: "Daily consumption data retrieved successfully" })
  @Get("/daily/:contractId/:date")
  getDailyConsumption(
    @Param("contractId") contractId: string,
    @Param("date") date: string,
    @CurrentUser() user: User
  ) {
    return this.consumptionService.getDailyConsumption(date, +contractId, user.id);
  }

  @ApiOperation({ summary: "Get monthly consumption for a contract" })
  @ApiParam({ name: "contractId", description: "Contract ID" })
  @ApiParam({ name: "date", description: "Date in YYYY-MM-DD format" })
  @ApiResponse({ status: 200, description: "Monthly consumption data retrieved successfully" })
  @Get("/monthly/:contractId/:date")
  getMonthlyConsumption(
    @Param("contractId") contractId: string,
    @Param("date") date: string,
    @CurrentUser() user: User
  ) {
    return this.consumptionService.getMonthlyConsumption(date, +contractId, user.id);
  }

  @ApiOperation({ summary: "Get monthly cost for a contract" })
  @ApiParam({ name: "contractId", description: "Contract ID" })
  @ApiParam({ name: "date", description: "Date in YYYY-MM-DD format" })
  @ApiResponse({ status: 200, description: "Monthly cost retrieved successfully" })
  @Get("/expenses/:contractId/:date/monthly")
  getMonthlyCost(
    @Param("contractId") contractId: string,
    @Param("date") date: string,
    @CurrentUser() user: User
  ) {
    return this.consumptionService.getMonthlyCost(date, +contractId, user.id);
  }

  @ApiOperation({ summary: "Get daily costs for each day of the month" })
  @ApiParam({ name: "contractId", description: "Contract ID" })
  @ApiParam({ name: "date", description: "Date in YYYY-MM-DD format" })
  @ApiResponse({ status: 200, description: "Daily costs for the month retrieved successfully" })
  @Get("/expenses/:contractId/:date/days-month")
  getDaysOfMonthCost(
    @Param("contractId") contractId: string,
    @Param("date") date: string,
    @CurrentUser() user: User
  ) {
    return this.consumptionService.getDaysOfMonthCost(date, +contractId, user.id);
  }

  @ApiOperation({ summary: "Create a new consumption record" })
  @ApiParam({ name: "contractId", description: "Contract ID" })
  @ApiResponse({ status: 201, description: "Consumption record created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @Post("/:contractId")
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param("contractId") contractId: string,
    @Body() createConsumptionDto: CreateConsumptionDto,
    @CurrentUser() user: User
  ) {
    return this.consumptionService.create(createConsumptionDto, +contractId, user.id);
  }

  @ApiOperation({ summary: "Create multiple consumption records" })
  @ApiParam({ name: "contractId", description: "Contract ID" })
  @ApiResponse({ status: 201, description: "Consumption records created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
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
