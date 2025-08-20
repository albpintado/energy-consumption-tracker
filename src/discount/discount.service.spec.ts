import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  buildCreateDiscountDto,
  buildDiscount,
  createMockRepository,
  MockRepository,
} from "../../test/factories";
import { DiscountService } from "./discount.service";
import { Discount } from "./entities/discount.entity";

describe("DiscountService", () => {
  let discountService: DiscountService;
  let discountRepository: MockRepository<Discount>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DiscountService,
        {
          provide: getRepositoryToken(Discount),
          useFactory: () => createMockRepository<Discount>(),
        },
      ],
    }).compile();

    discountService = moduleRef.get<DiscountService>(DiscountService);
    discountRepository = moduleRef.get<MockRepository<Discount>>(getRepositoryToken(Discount));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(discountService).toBeDefined();
  });

  describe("create", () => {
    it("should create a new discount", async () => {
      const createDiscountDto = buildCreateDiscountDto();
      const discount = buildDiscount();

      discountRepository.create.mockReturnValue(discount);
      discountRepository.save.mockResolvedValue(discount);

      const result = await discountService.create(createDiscountDto);

      expect(discountRepository.create).toHaveBeenCalledWith({
        percentage: createDiscountDto.percentage,
        startDate: createDiscountDto.startDate,
        endDate: createDiscountDto.endDate,
        rate: { id: createDiscountDto.rateId },
      });
      expect(discountRepository.save).toHaveBeenCalledWith(discount);
      expect(result).toEqual(discount);
    });

    it("should handle repository save errors", async () => {
      const createDiscountDto = buildCreateDiscountDto();
      const discount = buildDiscount();
      const error = new Error("Database error");

      discountRepository.create.mockReturnValue(discount);
      discountRepository.save.mockRejectedValue(error);

      await expect(discountService.create(createDiscountDto)).rejects.toThrow("Database error");
    });
  });

  describe("findByRate", () => {
    it("should find discount by rate ID", async () => {
      const rateId = 1;
      const discount = buildDiscount({ rate: { id: rateId } });

      discountRepository.findOne.mockResolvedValue(discount);

      const result = await discountService.findByRate(rateId);

      expect(discountRepository.findOne).toHaveBeenCalledWith({
        where: { rate: { id: rateId } },
      });
      expect(result).toEqual(discount);
    });

    it("should return null when no discount found", async () => {
      const rateId = 999;

      discountRepository.findOne.mockResolvedValue(null);

      const result = await discountService.findByRate(rateId);

      expect(discountRepository.findOne).toHaveBeenCalledWith({
        where: { rate: { id: rateId } },
      });
      expect(result).toBeNull();
    });
  });

  describe("activate", () => {
    it("should activate discount by setting endDate to null", async () => {
      const discountId = 1;
      const updateResult = { affected: 1 };

      discountRepository.update.mockResolvedValue(updateResult);

      const result = await discountService.activate(discountId);

      expect(discountRepository.update).toHaveBeenCalledWith(discountId, {
        endDate: null,
      });
      expect(result).toEqual(updateResult);
    });
  });

  describe("deactivate", () => {
    it("should deactivate discount by setting endDate", async () => {
      const discountId = 1;
      const dateString = "2024-12-31";
      const updateResult = { affected: 1 };

      discountRepository.update.mockResolvedValue(updateResult);

      const result = await discountService.deactivate(discountId, dateString);

      expect(discountRepository.update).toHaveBeenCalledWith(discountId, {
        endDate: new Date(dateString),
      });
      expect(result).toEqual(updateResult);
    });

    it("should handle different date formats", async () => {
      const discountId = 1;
      const dateString = "2024-06-15";
      const updateResult = { affected: 1 };

      discountRepository.update.mockResolvedValue(updateResult);

      const result = await discountService.deactivate(discountId, dateString);

      expect(discountRepository.update).toHaveBeenCalledWith(discountId, {
        endDate: new Date(dateString),
      });
      expect(result).toEqual(updateResult);
    });
  });
});
