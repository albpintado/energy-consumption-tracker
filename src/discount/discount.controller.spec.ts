import { Test, TestingModule } from "@nestjs/testing";
import { buildCreateDiscountDto, buildDiscount } from "../../test/factories";
import { DiscountController } from "./discount.controller";
import { DiscountService } from "./discount.service";
import { CreateDiscountDto } from "./dto/create-discount.dto";

describe("DiscountController", () => {
  let discountController: DiscountController;
  let discountService: jest.Mocked<DiscountService>;

  beforeEach(async () => {
    const mockDiscountService = {
      create: jest.fn(),
      activate: jest.fn(),
      deactivate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountController],
      providers: [
        {
          provide: DiscountService,
          useValue: mockDiscountService,
        },
      ],
    }).compile();

    discountController = module.get<DiscountController>(DiscountController);
    discountService = module.get(DiscountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(discountController).toBeDefined();
  });

  describe("create", () => {
    it("should create a new discount", async () => {
      const createDiscountDto: CreateDiscountDto = buildCreateDiscountDto();
      const expectedDiscount = buildDiscount();

      discountService.create.mockResolvedValue(expectedDiscount);

      const result = await discountController.create(createDiscountDto);

      expect(discountService.create).toHaveBeenCalledWith(createDiscountDto);
      expect(result).toEqual(expectedDiscount);
    });

    it("should handle service errors", async () => {
      const createDiscountDto: CreateDiscountDto = buildCreateDiscountDto();
      const error = new Error("Service error");

      discountService.create.mockRejectedValue(error);

      await expect(discountController.create(createDiscountDto)).rejects.toThrow("Service error");
      expect(discountService.create).toHaveBeenCalledWith(createDiscountDto);
    });

    it("should handle validation errors", async () => {
      const createDiscountDto: CreateDiscountDto = buildCreateDiscountDto({
        percentage: -10, // Invalid percentage
      });
      const error = new Error("Validation failed");

      discountService.create.mockRejectedValue(error);

      await expect(discountController.create(createDiscountDto)).rejects.toThrow(
        "Validation failed"
      );
      expect(discountService.create).toHaveBeenCalledWith(createDiscountDto);
    });
  });

  describe("update (activate)", () => {
    it("should activate discount", async () => {
      const discountId = "1";
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      discountService.activate.mockResolvedValue(updateResult);

      const result = await discountController.update(discountId);

      expect(discountService.activate).toHaveBeenCalledWith(1);
      expect(result).toEqual(updateResult);
    });

    it("should convert string ID to number", async () => {
      const discountId = "456";
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      discountService.activate.mockResolvedValue(updateResult);

      const result = await discountController.update(discountId);

      expect(discountService.activate).toHaveBeenCalledWith(456);
      expect(result).toEqual(updateResult);
    });

    it("should handle service errors", async () => {
      const discountId = "1";
      const error = new Error("Activation failed");

      discountService.activate.mockRejectedValue(error);

      await expect(discountController.update(discountId)).rejects.toThrow("Activation failed");
      expect(discountService.activate).toHaveBeenCalledWith(1);
    });

    it("should handle non-existent discount", async () => {
      const discountId = "999";
      const updateResult = { affected: 0, raw: {}, generatedMaps: [] };

      discountService.activate.mockResolvedValue(updateResult);

      const result = await discountController.update(discountId);

      expect(discountService.activate).toHaveBeenCalledWith(999);
      expect(result).toEqual(updateResult);
    });
  });

  describe("deactivate", () => {
    it("should deactivate discount with end date", async () => {
      const discountId = "1";
      const endDate = "2024-12-31";
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      discountService.deactivate.mockResolvedValue(updateResult);

      const result = await discountController.deactivate(discountId, endDate);

      expect(discountService.deactivate).toHaveBeenCalledWith(1, endDate);
      expect(result).toEqual(updateResult);
    });

    it("should convert string ID to number", async () => {
      const discountId = "789";
      const endDate = "2024-06-15";
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      discountService.deactivate.mockResolvedValue(updateResult);

      const result = await discountController.deactivate(discountId, endDate);

      expect(discountService.deactivate).toHaveBeenCalledWith(789, endDate);
      expect(result).toEqual(updateResult);
    });

    it("should handle different date formats", async () => {
      const discountId = "1";
      const endDate = "2024-01-01";
      const updateResult = { affected: 1, raw: {}, generatedMaps: [] };

      discountService.deactivate.mockResolvedValue(updateResult);

      const result = await discountController.deactivate(discountId, endDate);

      expect(discountService.deactivate).toHaveBeenCalledWith(1, endDate);
      expect(result).toEqual(updateResult);
    });

    it("should handle service errors", async () => {
      const discountId = "1";
      const endDate = "2024-12-31";
      const error = new Error("Deactivation failed");

      discountService.deactivate.mockRejectedValue(error);

      await expect(discountController.deactivate(discountId, endDate)).rejects.toThrow(
        "Deactivation failed"
      );
      expect(discountService.deactivate).toHaveBeenCalledWith(1, endDate);
    });

    it("should handle non-existent discount", async () => {
      const discountId = "999";
      const endDate = "2024-12-31";
      const updateResult = { affected: 0, raw: {}, generatedMaps: [] };

      discountService.deactivate.mockResolvedValue(updateResult);

      const result = await discountController.deactivate(discountId, endDate);

      expect(discountService.deactivate).toHaveBeenCalledWith(999, endDate);
      expect(result).toEqual(updateResult);
    });
  });
});
