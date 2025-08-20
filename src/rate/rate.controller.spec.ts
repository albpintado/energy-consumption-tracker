import { Test, TestingModule } from "@nestjs/testing";
import { buildCreateRateDto, buildRate } from "../../test/factories";
import { CreateRateDto } from "./dto/create-rate.dto";
import { RateController } from "./rate.controller";
import { RateService } from "./rate.service";

describe("RateController", () => {
  let rateController: RateController;
  let rateService: jest.Mocked<RateService>;

  beforeEach(async () => {
    const mockRateService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      activate: jest.fn(),
      deactivate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RateController],
      providers: [
        {
          provide: RateService,
          useValue: mockRateService,
        },
      ],
    }).compile();

    rateController = module.get<RateController>(RateController);
    rateService = module.get(RateService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(rateController).toBeDefined();
  });

  describe("create", () => {
    it("should create a new rate", async () => {
      const createRateDto: CreateRateDto = buildCreateRateDto();
      const expectedRate = buildRate();

      rateService.create.mockResolvedValue(expectedRate);

      const result = await rateController.create(createRateDto);

      expect(rateService.create).toHaveBeenCalledWith(createRateDto);
      expect(result).toEqual(expectedRate);
    });

    it("should handle service errors", async () => {
      const createRateDto: CreateRateDto = buildCreateRateDto();
      const error = new Error("Service error");

      rateService.create.mockRejectedValue(error);

      await expect(rateController.create(createRateDto)).rejects.toThrow("Service error");
      expect(rateService.create).toHaveBeenCalledWith(createRateDto);
    });
  });

  describe("findAll", () => {
    it("should return all rates", async () => {
      const expectedRates = [buildRate({ id: 1 }), buildRate({ id: 2 })];

      rateService.findAll.mockResolvedValue(expectedRates);

      const result = await rateController.findAll();

      expect(rateService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedRates);
    });

    it("should return empty array when no rates found", async () => {
      rateService.findAll.mockResolvedValue([]);

      const result = await rateController.findAll();

      expect(rateService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it("should handle service errors", async () => {
      const error = new Error("Service error");

      rateService.findAll.mockRejectedValue(error);

      await expect(rateController.findAll()).rejects.toThrow("Service error");
      expect(rateService.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return rate by ID", async () => {
      const rateId = "1";
      const expectedRate = buildRate({ id: 1 });

      rateService.findOne.mockResolvedValue(expectedRate);

      const result = await rateController.findOne(rateId);

      expect(rateService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(expectedRate);
    });

    it("should convert string ID to number", async () => {
      const rateId = "123";
      const expectedRate = buildRate({ id: 123 });

      rateService.findOne.mockResolvedValue(expectedRate);

      const result = await rateController.findOne(rateId);

      expect(rateService.findOne).toHaveBeenCalledWith(123);
      expect(result).toEqual(expectedRate);
    });

    it("should handle service errors", async () => {
      const rateId = "1";
      const error = new Error("Rate not found");

      rateService.findOne.mockRejectedValue(error);

      await expect(rateController.findOne(rateId)).rejects.toThrow("Rate not found");
      expect(rateService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe("activate", () => {
    it("should activate rate", async () => {
      const rateId = "1";
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      rateService.activate.mockResolvedValue(updateResult);

      const result = await rateController.activate(rateId);

      expect(rateService.activate).toHaveBeenCalledWith(1);
      expect(result).toEqual(updateResult);
    });

    it("should convert string ID to number", async () => {
      const rateId = "456";
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      rateService.activate.mockResolvedValue(updateResult);

      const result = await rateController.activate(rateId);

      expect(rateService.activate).toHaveBeenCalledWith(456);
      expect(result).toEqual(updateResult);
    });

    it("should handle service errors", async () => {
      const rateId = "1";
      const error = new Error("Activation failed");

      rateService.activate.mockRejectedValue(error);

      await expect(rateController.activate(rateId)).rejects.toThrow("Activation failed");
      expect(rateService.activate).toHaveBeenCalledWith(1);
    });
  });

  describe("remove (deactivate)", () => {
    it("should deactivate rate with end date", async () => {
      const rateId = "1";
      const endDate = "2024-12-31";
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      rateService.deactivate.mockResolvedValue(updateResult);

      const result = await rateController.remove(rateId, endDate);

      expect(rateService.deactivate).toHaveBeenCalledWith(1, endDate);
      expect(result).toEqual(updateResult);
    });

    it("should convert string ID to number", async () => {
      const rateId = "789";
      const endDate = "2024-06-15";
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      rateService.deactivate.mockResolvedValue(updateResult);

      const result = await rateController.remove(rateId, endDate);

      expect(rateService.deactivate).toHaveBeenCalledWith(789, endDate);
      expect(result).toEqual(updateResult);
    });

    it("should handle service errors", async () => {
      const rateId = "1";
      const endDate = "2024-12-31";
      const error = new Error("Deactivation failed");

      rateService.deactivate.mockRejectedValue(error);

      await expect(rateController.remove(rateId, endDate)).rejects.toThrow("Deactivation failed");
      expect(rateService.deactivate).toHaveBeenCalledWith(1, endDate);
    });
  });
});
