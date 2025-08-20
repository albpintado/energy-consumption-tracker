import * as bcrypt from "bcryptjs";
import { RegisterDto } from "../../src/auth/dto/register.dto";
import { User } from "../../src/user/entities/user.entity";

export const buildUser = (overrides = {}): User => {
  const user = new User();
  user.id = 1;
  user.email = "test@example.com";
  user.passwordHash = bcrypt.hashSync("password123", 10);
  user.firstName = "John";
  user.lastName = "Doe";
  user.isActive = true;
  user.createdAt = new Date();
  user.updatedAt = new Date();
  user.deletedAt = null;
  user.contracts = [];

  return Object.assign(user, overrides);
};

export const buildRegisterDto = (overrides = {}): RegisterDto => {
  return {
    email: "test@example.com",
    password: "password123",
    firstName: "John",
    lastName: "Doe",
    ...overrides,
  };
};
