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
import { CreateRateDto } from "./dto/create-rate.dto";
import { RateService } from "./rate.service";

@Controller("rate")
export class RateController {
  constructor(private readonly rateService: RateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRateDto: CreateRateDto) {
    return this.rateService.create(createRateDto);
  }

  @Get()
  findAll() {
    return this.rateService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.rateService.findOne(+id);
  }

  @Patch(":id")
  activate(@Param("id") id: string) {
    return this.rateService.activate(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Body("endDate") endDate: string) {
    return this.rateService.deactivate(+id, endDate);
  }
}
