import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CreateRateDto } from "./dto/create-rate.dto";
import { RateService } from "./rate.service";

@ApiTags("Rates")
@Controller("rate")
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @ApiOperation({ summary: "Create a new rate" })
  @ApiResponse({ status: 201, description: "Rate created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRateDto: CreateRateDto) {
    return this.rateService.create(createRateDto);
  }

  @ApiOperation({ summary: "Get all rates" })
  @ApiResponse({ status: 200, description: "Rates retrieved successfully" })
  @Get()
  findAll() {
    return this.rateService.findAll();
  }

  @ApiOperation({ summary: "Get a specific rate by ID" })
  @ApiParam({ name: "id", description: "Rate ID" })
  @ApiResponse({ status: 200, description: "Rate retrieved successfully" })
  @ApiResponse({ status: 404, description: "Rate not found" })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.rateService.findOne(+id);
  }

  @ApiOperation({ summary: "Activate a rate" })
  @ApiParam({ name: "id", description: "Rate ID" })
  @ApiResponse({ status: 200, description: "Rate activated successfully" })
  @ApiResponse({ status: 404, description: "Rate not found" })
  @Patch(":id")
  activate(@Param("id") id: string) {
    return this.rateService.activate(+id);
  }

  @ApiOperation({ summary: "Deactivate a rate" })
  @ApiParam({ name: "id", description: "Rate ID" })
  @ApiBody({
    schema: {
      type: "object",
      properties: { endDate: { type: "string", format: "date", example: "2024-12-31" } },
    },
  })
  @ApiResponse({ status: 200, description: "Rate deactivated successfully" })
  @ApiResponse({ status: 404, description: "Rate not found" })
  @Delete(":id")
  remove(@Param("id") id: string, @Body("endDate") endDate: string) {
    return this.rateService.deactivate(+id, endDate);
  }
}
