import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  buildContract,
  buildCreateContractDto,
  buildRate,
  buildUser,
  createMockRepository,
  MockRepository,
} from "../../test/factories";
import { Rate } from "../rate/entities/rate.entity";
import { ContractService } from "./contract.service";
import { Contract } from "./entities/contract.entity";

describe("ContractService", () => {
  let contractService: ContractService;
  let contractRepository: MockRepository<Contract>;
  let rateRepository: MockRepository<Rate>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ContractService,
        {
          provide: getRepositoryToken(Contract),
          useFactory: () => createMockRepository<Contract>(),
        },
        {
          provide: getRepositoryToken(Rate),
          useFactory: () => createMockRepository<Rate>(),
        },
      ],
    }).compile();

    contractService = moduleRef.get<ContractService>(ContractService);
    contractRepository = moduleRef.get<MockRepository<Contract>>(getRepositoryToken(Contract));
    rateRepository = moduleRef.get<MockRepository<Rate>>(getRepositoryToken(Rate));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(contractService).toBeDefined();
  });

  describe("create", () => {
    it("should create a new contract successfully", async () => {
      const createContractDto = buildCreateContractDto();
      const user = buildUser();
      const rate = buildRate({ id: createContractDto.rateId });
      const contract = buildContract();

      rateRepository.findOne.mockResolvedValue(rate);
      contractRepository.findOne.mockResolvedValue(null); // No existing contract
      contractRepository.create.mockReturnValue(contract);
      contractRepository.save.mockResolvedValue(contract);

      const result = await contractService.create(createContractDto, user);

      expect(rateRepository.findOne).toHaveBeenCalledWith({
        where: { id: createContractDto.rateId, endDate: null },
      });
      expect(contractRepository.findOne).toHaveBeenCalledWith({
        where: { contractNumber: createContractDto.contractNumber },
      });
      expect(contractRepository.create).toHaveBeenCalledWith({
        contractNumber: createContractDto.contractNumber,
        supplierName: createContractDto.supplierName,
        startDate: new Date(createContractDto.startDate),
        endDate: null,
        user,
        rate,
      });
      expect(contractRepository.save).toHaveBeenCalledWith(contract);
      expect(result).toEqual(contract);
    });

    it("should throw BadRequestException for non-existent rate", async () => {
      const createContractDto = buildCreateContractDto({ rateId: 999 });
      const user = buildUser();

      rateRepository.findOne.mockResolvedValue(null);

      await expect(contractService.create(createContractDto, user)).rejects.toThrow(
        new BadRequestException("Rate not found or inactive")
      );
    });

    it("should throw BadRequestException for duplicate contract number", async () => {
      const createContractDto = buildCreateContractDto();
      const user = buildUser();
      const rate = buildRate();
      const existingContract = buildContract();

      rateRepository.findOne.mockResolvedValue(rate);
      contractRepository.findOne.mockResolvedValue(existingContract);

      await expect(contractService.create(createContractDto, user)).rejects.toThrow(
        new BadRequestException("Contract number already exists")
      );
    });
  });

  describe("findAllByUser", () => {
    it("should return all active contracts for user", async () => {
      const userId = 1;
      const contracts = [buildContract({ id: 1 }), buildContract({ id: 2 })];

      contractRepository.find.mockResolvedValue(contracts);

      const result = await contractService.findAllByUser(userId);

      expect(contractRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId }, isActive: true },
        relations: ["rate", "rate.discounts"],
        order: { createdAt: "DESC" },
      });
      expect(result).toEqual(contracts);
    });

    it("should return empty array when no contracts found", async () => {
      const userId = 1;

      contractRepository.find.mockResolvedValue([]);

      const result = await contractService.findAllByUser(userId);

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return contract with relations", async () => {
      const contractId = 1;
      const userId = 1;
      const contract = buildContract({ id: contractId });

      contractRepository.findOne.mockResolvedValue(contract);

      const result = await contractService.findOne(contractId, userId);

      expect(contractRepository.findOne).toHaveBeenCalledWith({
        where: { id: contractId, user: { id: userId }, isActive: true },
        relations: ["rate", "rate.discounts", "consumptions"],
      });
      expect(result).toEqual(contract);
    });

    it("should throw NotFoundException when contract not found", async () => {
      const contractId = 999;
      const userId = 1;

      contractRepository.findOne.mockResolvedValue(null);

      await expect(contractService.findOne(contractId, userId)).rejects.toThrow(
        new NotFoundException("Contract not found")
      );
    });
  });

  describe("update", () => {
    it("should update contract successfully", async () => {
      const contractId = 1;
      const userId = 1;
      const updateDto = { supplierName: "Updated Supplier" };
      const contract = buildContract({ id: contractId });
      const updatedContract = buildContract({ ...contract, ...updateDto });

      contractRepository.findOne.mockResolvedValue(contract);
      contractRepository.save.mockResolvedValue(updatedContract);

      const result = await contractService.update(contractId, updateDto, userId);

      expect(contractRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateDto));
      expect(result).toEqual(updatedContract);
    });

    it("should update rate when rateId is provided", async () => {
      const contractId = 1;
      const userId = 1;
      const newRateId = 2;
      const updateDto = { rateId: newRateId };
      const contract = buildContract({ id: contractId, rate: { id: 1 } as Rate });
      const newRate = buildRate({ id: newRateId });

      contractRepository.findOne.mockResolvedValue(contract);
      rateRepository.findOne.mockResolvedValue(newRate);
      contractRepository.save.mockResolvedValue(contract);

      await contractService.update(contractId, updateDto, userId);

      expect(rateRepository.findOne).toHaveBeenCalledWith({
        where: { id: newRateId, endDate: null },
      });
      expect(contract.rate).toEqual(newRate);
    });

    it("should throw BadRequestException for non-existent rate", async () => {
      const contractId = 1;
      const userId = 1;
      const updateDto = { rateId: 999 };
      const contract = buildContract({ id: contractId });

      contractRepository.findOne.mockResolvedValue(contract);
      rateRepository.findOne.mockResolvedValue(null);

      await expect(contractService.update(contractId, updateDto, userId)).rejects.toThrow(
        new BadRequestException("Rate not found or inactive")
      );
    });
  });

  describe("deactivate", () => {
    it("should deactivate contract successfully", async () => {
      const contractId = 1;
      const userId = 1;
      const contract = buildContract({ id: contractId });

      contractRepository.findOne.mockResolvedValue(contract);
      contractRepository.save.mockResolvedValue(contract);

      const result = await contractService.deactivate(contractId, userId);

      expect(contractRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
          endDate: expect.any(Date),
        })
      );
      expect(result).toEqual({ message: "Contract deactivated successfully" });
    });
  });

  describe("validateContractOwnership", () => {
    it("should validate ownership successfully", async () => {
      const contractId = 1;
      const userId = 1;
      const contract = buildContract();

      contractRepository.findOne.mockResolvedValue(contract);

      await expect(
        contractService.validateContractOwnership(contractId, userId)
      ).resolves.not.toThrow();

      expect(contractRepository.findOne).toHaveBeenCalledWith({
        where: { id: contractId, user: { id: userId }, isActive: true },
      });
    });

    it("should throw ForbiddenException for invalid ownership", async () => {
      const contractId = 1;
      const userId = 2; // Different user

      contractRepository.findOne.mockResolvedValue(null);

      await expect(contractService.validateContractOwnership(contractId, userId)).rejects.toThrow(
        new ForbiddenException("Access denied to this contract")
      );
    });
  });
});
