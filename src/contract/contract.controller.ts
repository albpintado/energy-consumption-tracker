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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../user/entities/user.entity";
import { ContractService } from "./contract.service";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";

@ApiTags("Contracts")
@ApiBearerAuth()
@Controller("contracts")
@UseGuards(JwtAuthGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @ApiOperation({ summary: "Create a new contract" })
  @ApiResponse({ status: 201, description: "Contract created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createContractDto: CreateContractDto, @CurrentUser() user: User) {
    return this.contractService.create(createContractDto, user);
  }

  @ApiOperation({ summary: "Get all contracts for the current user" })
  @ApiResponse({ status: 200, description: "Contracts retrieved successfully" })
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.contractService.findAllByUser(user.id);
  }

  @ApiOperation({ summary: "Get a specific contract by ID" })
  @ApiParam({ name: "id", description: "Contract ID" })
  @ApiResponse({ status: 200, description: "Contract retrieved successfully" })
  @ApiResponse({ status: 404, description: "Contract not found" })
  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: User) {
    return this.contractService.findOne(+id, user.id);
  }

  @ApiOperation({ summary: "Update a contract" })
  @ApiParam({ name: "id", description: "Contract ID" })
  @ApiResponse({ status: 200, description: "Contract updated successfully" })
  @ApiResponse({ status: 404, description: "Contract not found" })
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateContractDto: UpdateContractDto,
    @CurrentUser() user: User
  ) {
    return this.contractService.update(+id, updateContractDto, user.id);
  }

  @ApiOperation({ summary: "Deactivate a contract" })
  @ApiParam({ name: "id", description: "Contract ID" })
  @ApiResponse({ status: 204, description: "Contract deactivated successfully" })
  @ApiResponse({ status: 404, description: "Contract not found" })
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id") id: string, @CurrentUser() user: User) {
    return this.contractService.deactivate(+id, user.id);
  }
}
