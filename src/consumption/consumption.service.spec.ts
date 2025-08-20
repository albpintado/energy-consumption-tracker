import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  buildConsumption,
  buildCreateConsumptionDto,
  buildDiscount,
  buildRate,
  buildContract,
  createMockRepository,
  MockRepository,
} from "../../test/factories";
import { ContractService } from "../contract/contract.service";
import { DiscountService } from "../discount/discount.service";
import { RateService } from "../rate/rate.service";
import { ConsumptionService } from "./consumption.service";
import { Consumption } from "./entities/consumption.entity";

describe("ConsumptionService", () => {
  let consumptionService: ConsumptionService;
  let consumptionRepository: MockRepository<Consumption>;
  let contractService: jest.Mocked<ContractService>;
  let rateService: jest.Mocked<RateService>;
  let discountService: jest.Mocked<DiscountService>;

  const mockRate = buildRate({
    id: 1,
    name: "Sun Club",
    peakEnergyPrice: 0.3,
    standardEnergyPrice: 0.2,
    offPeakEnergyPrice: 0.1,
    peakPowerPrice: 0.4,
    standardPowerPrice: 0.2,
    offPeakPowerPrice: 0,
  });

  const mockDiscount = buildDiscount({
    id: 1,
    percentage: 10,
    rate: mockRate,
  });

  const mockContract = buildContract({
    id: 1,
    rate: { ...mockRate, discounts: [mockDiscount] },
  });

  const contractId = 1;
  const userId = 1;

  beforeEach(async () => {
    const mockContractService = {
      validateContractOwnership: jest.fn(),
      findOne: jest.fn(),
    };

    const mockRateService = {
      findByName: jest.fn(),
    };

    const mockDiscountService = {
      findByRate: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ConsumptionService,
        {
          provide: getRepositoryToken(Consumption),
          useFactory: () => createMockRepository<Consumption>(),
        },
        {
          provide: ContractService,
          useValue: mockContractService,
        },
        {
          provide: RateService,
          useValue: mockRateService,
        },
        {
          provide: DiscountService,
          useValue: mockDiscountService,
        },
      ],
    }).compile();

    consumptionService = moduleRef.get<ConsumptionService>(ConsumptionService);
    consumptionRepository = moduleRef.get<MockRepository<Consumption>>(
      getRepositoryToken(Consumption)
    );
    contractService = moduleRef.get(ContractService);
    rateService = moduleRef.get(RateService);
    discountService = moduleRef.get(DiscountService);

    // Setup default mocks
    contractService.validateContractOwnership.mockResolvedValue(undefined);
    contractService.findOne.mockResolvedValue(mockContract);
    rateService.findByName.mockResolvedValue(mockRate);
    discountService.findByRate.mockResolvedValue(mockDiscount);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(consumptionService).toBeDefined();
  });

  describe("getDailyConsumption", () => {
    it("should return daily consumption for valid date", async () => {
      const date = "2024-01-15";
      const consumptions = [
        buildConsumption({ energy: 1.5, date: new Date(date) }),
        buildConsumption({ energy: 2.3, date: new Date(date) }),
        buildConsumption({ energy: 0.7, date: new Date(date) }),
      ];

      consumptionRepository.find.mockResolvedValue(consumptions);

      const result = await consumptionService.getDailyConsumption(date, contractId, userId);

      expect(contractService.validateContractOwnership).toHaveBeenCalledWith(contractId, userId);
      expect(consumptionRepository.find).toHaveBeenCalledWith({
        where: { 
          date: new Date(date),
          contract: { id: contractId }
        },
      });
      expect(result).toEqual({
        date,
        energy: 4.5,
      });
    });

    it("should return energy rounded to 3 decimal places", async () => {
      const date = "2024-01-15";
      const consumptions = [
        buildConsumption({ energy: 1.1111, date: new Date(date) }),
        buildConsumption({ energy: 2.2222, date: new Date(date) }),
      ];

      consumptionRepository.find.mockResolvedValue(consumptions);

      const result = await consumptionService.getDailyConsumption(date, contractId, userId);

      expect(result.energy).toBe(3.333);
    });

    it("should throw NotFoundException when no consumptions found", async () => {
      const date = "2024-01-15";

      consumptionRepository.find.mockResolvedValue([]);

      await expect(consumptionService.getDailyConsumption(date, contractId, userId)).rejects.toThrow(NotFoundException);
      expect(consumptionRepository.find).toHaveBeenCalledWith({
        where: { date: new Date(date) },
      });
    });

    it("should throw BadRequestException for invalid energy values", async () => {
      const date = "2024-01-15";
      const consumptions = [buildConsumption({ energy: null, date: new Date(date) })];

      consumptionRepository.find.mockResolvedValue(consumptions);

      await expect(consumptionService.getDailyConsumption(date, contractId, userId)).rejects.toThrow(
        BadRequestException
      );
      await expect(consumptionService.getDailyConsumption(date, contractId, userId)).rejects.toThrow(
        "Invalid energy value in consumption data"
      );
    });

    it("should throw BadRequestException for NaN energy values", async () => {
      const date = "2024-01-15";
      const consumptions = [buildConsumption({ energy: NaN, date: new Date(date) })];

      consumptionRepository.find.mockResolvedValue(consumptions);

      await expect(consumptionService.getDailyConsumption(date, contractId, userId)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("getMonthlyConsumption", () => {
    it("should return monthly consumption for valid date", async () => {
      const date = "2024-01-15";
      const consumptions = [
        buildConsumption({ energy: 1.5, date: new Date("2024-01-10") }),
        buildConsumption({ energy: 2.3, date: new Date("2024-01-15") }),
        buildConsumption({ energy: 0.7, date: new Date("2024-01-20") }),
      ];

      consumptionRepository.find.mockResolvedValue(consumptions);

      const result = await consumptionService.getMonthlyConsumption(date, contractId, userId);

      expect(consumptionRepository.find).toHaveBeenCalledWith({
        where: { date: expect.objectContaining({}) },
      });
      expect(result).toEqual({
        month: "January",
        energy: 4.5,
      });
    });

    it("should return energy rounded to 3 decimal places", async () => {
      const date = "2024-01-15";
      const consumptions = [
        buildConsumption({ energy: 1.1111, date: new Date("2024-01-15") }),
        buildConsumption({ energy: 2.2222, date: new Date("2024-01-15") }),
      ];

      consumptionRepository.find.mockResolvedValue(consumptions);

      const result = await consumptionService.getMonthlyConsumption(date, contractId, userId);

      expect(result.energy).toBe(3.333);
    });

    it("should throw BadRequestException for invalid date range", async () => {
      const date = "invalid-date";

      await expect(consumptionService.getMonthlyConsumption(date, contractId, userId)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw NotFoundException when no consumptions found", async () => {
      const date = "2024-01-15";

      consumptionRepository.find.mockResolvedValue([]);

      await expect(consumptionService.getMonthlyConsumption(date, contractId, userId)).rejects.toThrow(
        NotFoundException
      );
    });

    it("should throw BadRequestException for invalid energy values", async () => {
      const date = "2024-01-15";
      const consumptions = [buildConsumption({ energy: null, date: new Date("2024-01-15") })];

      consumptionRepository.find.mockResolvedValue(consumptions);

      await expect(consumptionService.getMonthlyConsumption(date, contractId, userId)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("getDaysOfMonthCost", () => {
    it("should return daily costs for valid month", async () => {
      const date = "2024-01-15";
      const consumptions = [
        buildConsumption({ energy: 1.5, date: new Date("2024-01-10") }),
        buildConsumption({ energy: 2.3, date: new Date("2024-01-15") }),
      ];

      consumptionRepository.find.mockResolvedValue(consumptions);

      const result = await consumptionService.getDaysOfMonthCost(date, contractId, userId);

      expect(rateService.findByName).toHaveBeenCalledWith("Sun Club");
      expect(discountService.findByRate).toHaveBeenCalledWith(mockRate.id);
      expect(consumptionRepository.find).toHaveBeenCalledWith({
        where: { date: expect.objectContaining({}) },
      });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should throw BadRequestException for invalid date range", async () => {
      const date = "invalid-date";

      await expect(consumptionService.getDaysOfMonthCost(date, contractId, userId)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw NotFoundException when no consumptions found", async () => {
      const date = "2024-01-15";

      consumptionRepository.find.mockResolvedValue([]);

      await expect(consumptionService.getDaysOfMonthCost(date, contractId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe("getMonthlyCost", () => {
    it("should return monthly cost with energy and power costs", async () => {
      const date = "2024-01-15";
      const consumptions = [
        buildConsumption({
          energy: 1.5,
          date: new Date("2024-01-15"),
          hour: 12, // peak hour
        }),
        buildConsumption({
          energy: 2.0,
          date: new Date("2024-01-16"),
          hour: 6, // off-peak hour
        }),
      ];

      consumptionRepository.find.mockResolvedValue(consumptions);

      const result = await consumptionService.getMonthlyCost(date, contractId, userId);

      expect(rateService.findByName).toHaveBeenCalledWith("Sun Club");
      expect(discountService.findByRate).toHaveBeenCalledWith(mockRate.id);
      expect(result).toEqual({
        date,
        energyCost: expect.any(Number),
        powerCost: expect.any(Number),
        totalCost: expect.any(Number),
      });
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it("should throw BadRequestException for invalid date range", async () => {
      const date = "invalid-date";

      await expect(consumptionService.getMonthlyCost(date, contractId, userId)).rejects.toThrow(BadRequestException);
    });

    it("should throw NotFoundException when no consumptions found", async () => {
      const date = "2024-01-15";

      consumptionRepository.find.mockResolvedValue([]);

      await expect(consumptionService.getMonthlyCost(date, contractId, userId)).rejects.toThrow(NotFoundException);
    });

    it("should handle invalid energy values in cost calculation", async () => {
      const date = "2024-01-15";
      const consumptions = [
        buildConsumption({
          energy: null,
          date: new Date(date),
          hour: 12,
        }),
      ];

      consumptionRepository.find.mockResolvedValue(consumptions);

      await expect(consumptionService.getMonthlyCost(date, contractId, userId)).rejects.toThrow(BadRequestException);
    });

    it("should calculate costs correctly for different periods", async () => {
      const date = "2024-01-15";
      const consumptions = [
        buildConsumption({ energy: 1.0, date: new Date(date), hour: 12 }), // peak
        buildConsumption({ energy: 1.5, date: new Date(date), hour: 9 }), // standard
        buildConsumption({ energy: 2.0, date: new Date(date), hour: 3 }), // off-peak
      ];

      consumptionRepository.find.mockResolvedValue(consumptions);

      const result = await consumptionService.getMonthlyCost(date, contractId, userId);

      expect(result.energyCost).toBeGreaterThan(0);
      expect(result.powerCost).toBeGreaterThan(0);
      expect(result.totalCost).toBe(result.energyCost + result.powerCost);
    });

    it("should round total cost to 2 decimal places", async () => {
      const date = "2024-01-15";
      const consumptions = [
        buildConsumption({
          energy: 1.333,
          date: new Date(date),
          hour: 12,
        }),
      ];

      consumptionRepository.find.mockResolvedValue(consumptions);

      const result = await consumptionService.getMonthlyCost(date, contractId, userId);

      expect(result.totalCost).toEqual(parseFloat(result.totalCost.toFixed(2)));
    });
  });

  describe("create", () => {
    it("should create a new consumption", async () => {
      const createConsumptionDto = buildCreateConsumptionDto();
      const consumption = buildConsumption();

      consumptionRepository.create.mockReturnValue(consumption);
      consumptionRepository.save.mockResolvedValue(consumption);

      const result = await consumptionService.create(createConsumptionDto, contractId, userId);

      expect(consumptionRepository.create).toHaveBeenCalledWith(createConsumptionDto);
      expect(consumptionRepository.save).toHaveBeenCalledWith(consumption);
      expect(result).toEqual(consumption);
    });

    it("should handle repository save errors", async () => {
      const createConsumptionDto = buildCreateConsumptionDto();
      const consumption = buildConsumption();
      const error = new Error("Database error");

      consumptionRepository.create.mockReturnValue(consumption);
      consumptionRepository.save.mockRejectedValue(error);

      await expect(consumptionService.create(createConsumptionDto, contractId, userId)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("createAll", () => {
    it("should create multiple consumptions", async () => {
      const consumptionDtos = [
        buildCreateConsumptionDto({ date: "2024-01-15", hour: 12 }),
        buildCreateConsumptionDto({ date: "2024-01-15", hour: 13 }),
      ];
      const consumptions = [
        buildConsumption({ date: new Date("2024-01-15"), hour: 12 }),
        buildConsumption({ date: new Date("2024-01-15"), hour: 13 }),
      ];

      consumptionRepository.create.mockImplementation(dto =>
        buildConsumption({
          date: new Date(dto.date),
          hour: dto.hour,
          energy: dto.energy,
        })
      );
      consumptionRepository.save.mockResolvedValue(consumptions);
      consumptionRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await consumptionService.createAll(consumptionDtos, contractId, userId);

      expect(consumptionRepository.delete).toHaveBeenCalledTimes(2);
      expect(consumptionRepository.create).toHaveBeenCalledTimes(2);
      expect(consumptionRepository.save).toHaveBeenCalledWith(expect.any(Array));
      expect(result).toEqual(consumptions);
    });

    it("should throw BadRequestException for invalid consumption data", () => {
      const consumptionDtos = [buildCreateConsumptionDto({ date: null })];

      expect(() => consumptionService.createAll(consumptionDtos, contractId, userId)).toThrow(BadRequestException);
      expect(() => consumptionService.createAll(consumptionDtos, contractId, userId)).toThrow(
        "Invalid consumption data"
      );
    });

    it("should throw BadRequestException for null hour", () => {
      const consumptionDtos = [buildCreateConsumptionDto({ hour: null })];

      expect(() => consumptionService.createAll(consumptionDtos, contractId, userId)).toThrow(BadRequestException);
      expect(() => consumptionService.createAll(consumptionDtos, contractId, userId)).toThrow(
        "Invalid consumption data"
      );
    });

    it("should throw BadRequestException for null energy", () => {
      const consumptionDtos = [buildCreateConsumptionDto({ energy: null })];

      expect(() => consumptionService.createAll(consumptionDtos, contractId, userId)).toThrow(BadRequestException);
      expect(() => consumptionService.createAll(consumptionDtos, contractId, userId)).toThrow(
        "Invalid consumption data"
      );
    });

    it("should throw BadRequestException for invalid date", () => {
      const consumptionDtos = [buildCreateConsumptionDto({ date: "invalid-date" })];

      expect(() => consumptionService.createAll(consumptionDtos, contractId, userId)).toThrow(BadRequestException);
      expect(() => consumptionService.createAll(consumptionDtos, contractId, userId)).toThrow("Invalid date");
    });

    it("should handle repository save errors", async () => {
      const consumptionDtos = [buildCreateConsumptionDto({ date: "2024-01-15", hour: 12 })];
      const error = new Error("Database error");

      consumptionRepository.create.mockImplementation(dto =>
        buildConsumption({
          date: new Date(dto.date),
          hour: dto.hour,
          energy: dto.energy,
        })
      );
      consumptionRepository.delete.mockResolvedValue({ affected: 1 });
      consumptionRepository.save.mockRejectedValue(error);

      await expect(consumptionService.createAll(consumptionDtos, contractId, userId)).rejects.toThrow("Database error");
    });
  });
});
