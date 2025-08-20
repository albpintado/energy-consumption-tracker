import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rate } from "../rate/entities/rate.entity";
import { User } from "../user/entities/user.entity";
import { CreateContractDto } from "./dto/create-contract.dto";
import { UpdateContractDto } from "./dto/update-contract.dto";
import { Contract } from "./entities/contract.entity";

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(Rate)
    private rateRepository: Repository<Rate>
  ) {}

  async create(createContractDto: CreateContractDto, user: User): Promise<Contract> {
    const { rateId, ...contractData } = createContractDto;

    const rate = await this.rateRepository.findOne({
      where: { id: rateId, endDate: null },
    });

    if (!rate) {
      throw new BadRequestException("Rate not found or inactive");
    }

    const existingContract = await this.contractRepository.findOne({
      where: { contractNumber: createContractDto.contractNumber },
    });

    if (existingContract) {
      throw new BadRequestException("Contract number already exists");
    }

    const contract = this.contractRepository.create({
      ...contractData,
      startDate: new Date(contractData.startDate),
      endDate: contractData.endDate ? new Date(contractData.endDate) : null,
      user,
      rate,
    });

    return this.contractRepository.save(contract);
  }

  async findAllByUser(userId: number): Promise<Contract[]> {
    return this.contractRepository.find({
      where: { user: { id: userId }, isActive: true },
      relations: ["rate", "rate.discounts"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number, userId: number): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id, user: { id: userId }, isActive: true },
      relations: ["rate", "rate.discounts", "consumptions"],
    });

    if (!contract) {
      throw new NotFoundException("Contract not found");
    }

    return contract;
  }

  async update(
    id: number,
    updateContractDto: UpdateContractDto,
    userId: number
  ): Promise<Contract> {
    const contract = await this.findOne(id, userId);

    if (updateContractDto.rateId && updateContractDto.rateId !== contract.rate.id) {
      const rate = await this.rateRepository.findOne({
        where: { id: updateContractDto.rateId, endDate: null },
      });

      if (!rate) {
        throw new BadRequestException("Rate not found or inactive");
      }

      contract.rate = rate;
    }

    if (
      updateContractDto.contractNumber &&
      updateContractDto.contractNumber !== contract.contractNumber
    ) {
      const existingContract = await this.contractRepository.findOne({
        where: { contractNumber: updateContractDto.contractNumber },
      });

      if (existingContract && existingContract.id !== id) {
        throw new BadRequestException("Contract number already exists");
      }
    }

    Object.assign(contract, {
      ...updateContractDto,
      startDate: updateContractDto.startDate
        ? new Date(updateContractDto.startDate)
        : contract.startDate,
      endDate: updateContractDto.endDate ? new Date(updateContractDto.endDate) : contract.endDate,
    });

    return this.contractRepository.save(contract);
  }

  async deactivate(id: number, userId: number): Promise<{ message: string }> {
    const contract = await this.findOne(id, userId);

    contract.isActive = false;
    contract.endDate = new Date();

    await this.contractRepository.save(contract);

    return { message: "Contract deactivated successfully" };
  }

  async validateContractOwnership(contractId: number, userId: number): Promise<void> {
    const contract = await this.contractRepository.findOne({
      where: { id: contractId, user: { id: userId }, isActive: true },
    });

    if (!contract) {
      throw new ForbiddenException("Access denied to this contract");
    }
  }
}
