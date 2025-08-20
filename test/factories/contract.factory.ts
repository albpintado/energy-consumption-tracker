import { CreateContractDto } from "../../src/contract/dto/create-contract.dto";
import { Contract } from "../../src/contract/entities/contract.entity";
import { Rate } from "../../src/rate/entities/rate.entity";
import { User } from "../../src/user/entities/user.entity";

export const buildContract = (overrides = {}): Contract => {
  const contract = new Contract();
  contract.id = 1;
  contract.contractNumber = "CONT-2024-001";
  contract.supplierName = "Energy Supplier Co.";
  contract.startDate = new Date("2024-01-01");
  contract.endDate = null;
  contract.isActive = true;
  contract.createdAt = new Date();
  contract.updatedAt = new Date();
  contract.deletedAt = null;
  contract.user = { id: 1 } as User;
  contract.rate = { id: 1 } as Rate;
  contract.consumptions = [];

  return Object.assign(contract, overrides);
};

export const buildCreateContractDto = (overrides = {}): CreateContractDto => {
  return {
    contractNumber: "CONT-2024-001",
    supplierName: "Energy Supplier Co.",
    startDate: "2024-01-01",
    rateId: 1,
    ...overrides,
  };
};
