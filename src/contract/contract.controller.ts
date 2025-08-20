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
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../user/entities/user.entity";
import { ContractService } from "./contract.service";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";

@Controller("contracts")
@UseGuards(JwtAuthGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createContractDto: CreateContractDto, @CurrentUser() user: User) {
    return this.contractService.create(createContractDto, user);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.contractService.findAllByUser(user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: User) {
    return this.contractService.findOne(+id, user.id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateContractDto: UpdateContractDto,
    @CurrentUser() user: User
  ) {
    return this.contractService.update(+id, updateContractDto, user.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string, @CurrentUser() user: User) {
    return this.contractService.deactivate(+id, user.id);
  }
}
