import { Test, TestingModule } from "@nestjs/testing";
import { buildConsumption, buildCreateConsumptionDto } from "../../test/factories";
import { ConsumptionController } from "./consumption.controller";
import { ConsumptionService } from "./consumption.service";
import { CreateConsumptionDto } from "./dto/create-consumption.dto";

describe("ConsumptionController", () => {
  let consumptionController: ConsumptionController;
  let consumptionService: jest.Mocked<ConsumptionService>;

  beforeEach(async () => {
    const mockConsumptionService = {
      getDailyConsumption: jest.fn(),
      getMonthlyConsumption: jest.fn(),
      getMonthlyCost: jest.fn(),
      getDaysOfMonthCost: jest.fn(),
      create: jest.fn(),
      createAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsumptionController],
      providers: [
        {
          provide: ConsumptionService,
          useValue: mockConsumptionService,
        },
      ],
    }).compile();

    consumptionController = module.get<ConsumptionController>(ConsumptionController);
    consumptionService = module.get(ConsumptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(consumptionController).toBeDefined();
  });

  describe("getDailyConsumption", () => {
    it("should return daily consumption for given date", async () => {
      const date = "2024-01-15";
      const expectedResult = { date, energy: 4.5 };

      consumptionService.getDailyConsumption.mockResolvedValue(expectedResult);

      const result = await consumptionController.getDailyConsumption(date);

      expect(consumptionService.getDailyConsumption).toHaveBeenCalledWith(date);
      expect(result).toEqual(expectedResult);
    });

    it("should handle service errors", async () => {
      const date = "2024-01-15";
      const error = new Error("No consumption data found");

      consumptionService.getDailyConsumption.mockRejectedValue(error);

      await expect(consumptionController.getDailyConsumption(date)).rejects.toThrow(
        "No consumption data found"
      );
      expect(consumptionService.getDailyConsumption).toHaveBeenCalledWith(date);
    });

    it("should handle different date formats", async () => {
      const date = "2024-12-25";
      const expectedResult = { date, energy: 2.1 };

      consumptionService.getDailyConsumption.mockResolvedValue(expectedResult);

      const result = await consumptionController.getDailyConsumption(date);

      expect(consumptionService.getDailyConsumption).toHaveBeenCalledWith(date);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("getMonthlyConsumption", () => {
    it("should return monthly consumption for given date", async () => {
      const date = "2024-01-15";
      const expectedResult = { month: "January", energy: 120.5 };

      consumptionService.getMonthlyConsumption.mockResolvedValue(expectedResult);

      const result = await consumptionController.getMonthlyConsumption(date);

      expect(consumptionService.getMonthlyConsumption).toHaveBeenCalledWith(date);
      expect(result).toEqual(expectedResult);
    });

    it("should handle service errors", async () => {
      const date = "invalid-date";
      const error = new Error("Invalid date format");

      consumptionService.getMonthlyConsumption.mockRejectedValue(error);

      await expect(consumptionController.getMonthlyConsumption(date)).rejects.toThrow(
        "Invalid date format"
      );
      expect(consumptionService.getMonthlyConsumption).toHaveBeenCalledWith(date);
    });

    it("should handle different months", async () => {
      const date = "2024-06-10";
      const expectedResult = { month: "June", energy: 85.3 };

      consumptionService.getMonthlyConsumption.mockResolvedValue(expectedResult);

      const result = await consumptionController.getMonthlyConsumption(date);

      expect(consumptionService.getMonthlyConsumption).toHaveBeenCalledWith(date);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("getMonthlyCost", () => {
    it("should return monthly cost for given date", async () => {
      const date = "2024-01-15";
      const expectedResult = {
        date,
        energyCost: 45.67,
        powerCost: 12.34,
        totalCost: 58.01,
      };

      consumptionService.getMonthlyCost.mockResolvedValue(expectedResult);

      const result = await consumptionController.getMonthlyCost(date);

      expect(consumptionService.getMonthlyCost).toHaveBeenCalledWith(date);
      expect(result).toEqual(expectedResult);
    });

    it("should handle service errors", async () => {
      const date = "2024-01-15";
      const error = new Error("Cost calculation failed");

      consumptionService.getMonthlyCost.mockRejectedValue(error);

      await expect(consumptionController.getMonthlyCost(date)).rejects.toThrow(
        "Cost calculation failed"
      );
      expect(consumptionService.getMonthlyCost).toHaveBeenCalledWith(date);
    });

    it("should handle zero costs", async () => {
      const date = "2024-01-15";
      const expectedResult = {
        date,
        energyCost: 0,
        powerCost: 0,
        totalCost: 0,
      };

      consumptionService.getMonthlyCost.mockResolvedValue(expectedResult);

      const result = await consumptionController.getMonthlyCost(date);

      expect(consumptionService.getMonthlyCost).toHaveBeenCalledWith(date);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("getDaysOfMonthCost", () => {
    it("should return daily costs for given month", async () => {
      const date = "2024-01-15";
      const expectedResult = [
        { date: "2024-01-01", energy: 5.67 },
        { date: "2024-01-02", energy: 7.89 },
      ];

      consumptionService.getDaysOfMonthCost.mockResolvedValue(expectedResult);

      const result = await consumptionController.getDaysOfMonthCost(date);

      expect(consumptionService.getDaysOfMonthCost).toHaveBeenCalledWith(date);
      expect(result).toEqual(expectedResult);
    });

    it("should handle service errors", async () => {
      const date = "2024-01-15";
      const error = new Error("Daily cost calculation failed");

      consumptionService.getDaysOfMonthCost.mockRejectedValue(error);

      await expect(consumptionController.getDaysOfMonthCost(date)).rejects.toThrow(
        "Daily cost calculation failed"
      );
      expect(consumptionService.getDaysOfMonthCost).toHaveBeenCalledWith(date);
    });

    it("should handle empty results", async () => {
      const date = "2024-01-15";
      const expectedResult: any[] = [];

      consumptionService.getDaysOfMonthCost.mockResolvedValue(expectedResult);

      const result = await consumptionController.getDaysOfMonthCost(date);

      expect(consumptionService.getDaysOfMonthCost).toHaveBeenCalledWith(date);
      expect(result).toEqual(expectedResult);
    });
  });

  describe("create", () => {
    it("should create a new consumption", async () => {
      const createConsumptionDto: CreateConsumptionDto = buildCreateConsumptionDto();
      const expectedConsumption = buildConsumption();

      consumptionService.create.mockResolvedValue(expectedConsumption);

      const result = await consumptionController.create(createConsumptionDto);

      expect(consumptionService.create).toHaveBeenCalledWith(createConsumptionDto);
      expect(result).toEqual(expectedConsumption);
    });

    it("should handle service errors", async () => {
      const createConsumptionDto: CreateConsumptionDto = buildCreateConsumptionDto();
      const error = new Error("Creation failed");

      consumptionService.create.mockRejectedValue(error);

      await expect(consumptionController.create(createConsumptionDto)).rejects.toThrow(
        "Creation failed"
      );
      expect(consumptionService.create).toHaveBeenCalledWith(createConsumptionDto);
    });

    it("should handle validation errors", async () => {
      const createConsumptionDto: CreateConsumptionDto = buildCreateConsumptionDto({
        energy: -1, // Invalid energy value
      });
      const error = new Error("Validation failed");

      consumptionService.create.mockRejectedValue(error);

      await expect(consumptionController.create(createConsumptionDto)).rejects.toThrow(
        "Validation failed"
      );
      expect(consumptionService.create).toHaveBeenCalledWith(createConsumptionDto);
    });
  });

  describe("createAll", () => {
    it("should create multiple consumptions", async () => {
      const consumptionDtos: CreateConsumptionDto[] = [
        buildCreateConsumptionDto({ hour: 12 }),
        buildCreateConsumptionDto({ hour: 13 }),
      ];
      const expectedConsumptions = [buildConsumption({ hour: 12 }), buildConsumption({ hour: 13 })];

      consumptionService.createAll.mockResolvedValue(expectedConsumptions);

      const result = await consumptionController.createAll(consumptionDtos);

      expect(consumptionService.createAll).toHaveBeenCalledWith(consumptionDtos);
      expect(result).toEqual(expectedConsumptions);
    });

    it("should handle service errors", async () => {
      const consumptionDtos: CreateConsumptionDto[] = [buildCreateConsumptionDto()];
      const error = new Error("Batch creation failed");

      consumptionService.createAll.mockRejectedValue(error);

      await expect(consumptionController.createAll(consumptionDtos)).rejects.toThrow(
        "Batch creation failed"
      );
      expect(consumptionService.createAll).toHaveBeenCalledWith(consumptionDtos);
    });

    it("should handle empty array", async () => {
      const consumptionDtos: CreateConsumptionDto[] = [];
      const expectedResult: any[] = [];

      consumptionService.createAll.mockResolvedValue(expectedResult);

      const result = await consumptionController.createAll(consumptionDtos);

      expect(consumptionService.createAll).toHaveBeenCalledWith(consumptionDtos);
      expect(result).toEqual(expectedResult);
    });

    it("should handle validation errors in batch", async () => {
      const consumptionDtos: CreateConsumptionDto[] = [buildCreateConsumptionDto({ date: null })];
      const error = new Error("Invalid consumption data");

      consumptionService.createAll.mockRejectedValue(error);

      await expect(consumptionController.createAll(consumptionDtos)).rejects.toThrow(
        "Invalid consumption data"
      );
      expect(consumptionService.createAll).toHaveBeenCalledWith(consumptionDtos);
    });
  });
});
