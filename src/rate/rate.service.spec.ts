import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  buildCreateRateDto,
  buildRate,
  buildUpdateRateDto,
  createMockRepository,
  MockRepository,
} from "../../test/factories";
import { Rate } from "./entities/rate.entity";
import { RateService } from "./rate.service";

describe("RateService", () => {
  let rateRepository: MockRepository<Rate>;
  let rateService: RateService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RateService,
        {
          provide: getRepositoryToken(Rate),
          useFactory: () => createMockRepository<Rate>(),
        },
      ],
    }).compile();

    rateService = moduleRef.get<RateService>(RateService);
    rateRepository = moduleRef.get<MockRepository<Rate>>(getRepositoryToken(Rate));
  });

  describe("create", () => {
    it("should create a new rate", async () => {
      const createRateDto = buildCreateRateDto();
      const expectedRate = buildRate({ name: createRateDto.name });

      rateRepository.create.mockReturnValue(expectedRate);
      rateRepository.save.mockResolvedValue(expectedRate);

      const result = await rateService.create(createRateDto);

      expect(rateRepository.create).toHaveBeenCalledWith(createRateDto);
      expect(rateRepository.save).toHaveBeenCalledWith(expectedRate);
      expect(result).toEqual(expectedRate);
    });

    it("should handle repository save errors", async () => {
      const createRateDto = buildCreateRateDto();
      const rate = buildRate();
      const error = new Error("Database error");

      rateRepository.create.mockReturnValue(rate);
      rateRepository.save.mockRejectedValue(error);

      await expect(rateService.create(createRateDto)).rejects.toThrow("Database error");
      expect(rateRepository.create).toHaveBeenCalledWith(createRateDto);
      expect(rateRepository.save).toHaveBeenCalledWith(rate);
    });
  });

  describe("findAll", () => {
    it("should return array of rates when rates exist", async () => {
      const rates = [buildRate({ id: 1 }), buildRate({ id: 2, name: "Rate 2" })];

      rateRepository.find.mockResolvedValue(rates);

      const result = await rateService.findAll();

      expect(rateRepository.find).toHaveBeenCalled();
      expect(result).toEqual(rates);
    });

    it("should return empty array when no rates exist", async () => {
      rateRepository.find.mockResolvedValue([]);

      const result = await rateService.findAll();

      expect(rateRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return rate when valid ID provided", async () => {
      const rate = buildRate({ id: 1 });

      rateRepository.findOneBy.mockResolvedValue(rate);

      const result = await rateService.findOne(1);

      expect(rateRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(rate);
    });

    it("should return null when rate not found", async () => {
      rateRepository.findOneBy.mockResolvedValue(null);

      const result = await rateService.findOne(999);

      expect(rateRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(result).toBeNull();
    });
  });

  describe("findByName", () => {
    it("should return rate when valid name provided", async () => {
      const rate = buildRate({ name: "Test Rate" });

      rateRepository.findOne.mockResolvedValue(rate);

      const result = await rateService.findByName("Test Rate");

      expect(rateRepository.findOne).toHaveBeenCalledWith({ where: { name: "Test Rate" } });
      expect(result).toEqual(rate);
    });

    it("should return null when rate not found", async () => {
      rateRepository.findOne.mockResolvedValue(null);

      const result = await rateService.findByName("Non-existent Rate");

      expect(rateRepository.findOne).toHaveBeenCalledWith({ where: { name: "Non-existent Rate" } });
      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update rate with valid data", async () => {
      const updateRateDto = buildUpdateRateDto({ name: "Updated Rate" });
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      rateRepository.update.mockResolvedValue(updateResult);

      const result = await rateService.update(1, updateRateDto);

      expect(rateRepository.update).toHaveBeenCalledWith(1, updateRateDto);
      expect(result).toEqual(updateResult);
    });

    it("should return update result even when no rows affected", async () => {
      const updateRateDto = buildUpdateRateDto();
      const updateResult = { affected: 0, raw: {}, generatedMaps: [] };

      rateRepository.update.mockResolvedValue(updateResult);

      const result = await rateService.update(999, updateRateDto);

      expect(rateRepository.update).toHaveBeenCalledWith(999, updateRateDto);
      expect(result).toEqual(updateResult);
    });
  });

  describe("activate", () => {
    it("should activate rate by setting endDate to null", async () => {
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      rateRepository.update.mockResolvedValue(updateResult);

      const result = await rateService.activate(1);

      expect(rateRepository.update).toHaveBeenCalledWith(1, { endDate: null });
      expect(result).toEqual(updateResult);
    });
  });

  describe("deactivate", () => {
    it("should deactivate rate with provided end date", async () => {
      const endDateString = "2024-12-31";
      const expectedDate = new Date(endDateString);
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      rateRepository.update.mockResolvedValue(updateResult);

      const result = await rateService.deactivate(1, endDateString);

      expect(rateRepository.update).toHaveBeenCalledWith(1, { endDate: expectedDate });
      expect(result).toEqual(updateResult);
    });

    it("should handle invalid date strings", async () => {
      const invalidDateString = "invalid-date";
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      rateRepository.update.mockResolvedValue(updateResult);

      const result = await rateService.deactivate(1, invalidDateString);

      expect(rateRepository.update).toHaveBeenCalledWith(1, {
        endDate: expect.any(Date),
      });
      expect(rateRepository.update.mock.calls[0][1].endDate.toString()).toBe("Invalid Date");
      expect(result).toEqual(updateResult);
    });
  });
});
