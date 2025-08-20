import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as bcrypt from "bcryptjs";
import {
  buildRegisterDto,
  buildUser,
  createMockRepository,
  MockRepository,
} from "../../test/factories";
import { User } from "../user/entities/user.entity";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

describe("AuthService", () => {
  let authService: AuthService;
  let userRepository: MockRepository<User>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockJwtService = {
      sign: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useFactory: () => createMockRepository<User>(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    userRepository = moduleRef.get<MockRepository<User>>(getRepositoryToken(User));
    jwtService = moduleRef.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const registerDto = buildRegisterDto();
      const user = buildUser();
      const token = "jwt.token.here";

      userRepository.findOne.mockResolvedValue(null); // No existing user
      userRepository.create.mockReturnValue(user);
      userRepository.save.mockResolvedValue(user);
      jwtService.sign.mockReturnValue(token);

      const result = await authService.register(registerDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(userRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: expect.any(String), // hashed password
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(result).toEqual({
        user: expect.objectContaining({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        }),
        access_token: token,
      });
      expect(result.user).not.toHaveProperty("password");
    });

    it("should throw BadRequestException if user already exists", async () => {
      const registerDto = buildRegisterDto();
      const existingUser = buildUser();

      userRepository.findOne.mockResolvedValue(existingUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        new BadRequestException("User with this email already exists")
      );
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it("should hash the password before saving", async () => {
      const registerDto = buildRegisterDto({ password: "plainPassword" });
      const user = buildUser();

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(user);
      userRepository.save.mockResolvedValue(user);
      jwtService.sign.mockReturnValue("token");

      await authService.register(registerDto);

      const createCall = userRepository.create.mock.calls[0][0];
      const hashedPassword = createCall.password;

      expect(hashedPassword).not.toBe("plainPassword");
      expect(await bcrypt.compare("plainPassword", hashedPassword)).toBe(true);
    });
  });

  describe("login", () => {
    it("should login user successfully with valid credentials", async () => {
      const loginDto: LoginDto = { email: "test@example.com", password: "password123" };
      const user = buildUser({
        email: loginDto.email,
        password: await bcrypt.hash(loginDto.password, 10),
      });
      const token = "jwt.token.here";

      userRepository.findOne.mockResolvedValue(user);
      jwtService.sign.mockReturnValue(token);

      const result = await authService.login(loginDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email, isActive: true },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(result).toEqual({
        user: expect.objectContaining({
          id: user.id,
          email: user.email,
        }),
        access_token: token,
      });
      expect(result.user).not.toHaveProperty("password");
    });

    it("should throw UnauthorizedException for non-existent user", async () => {
      const loginDto: LoginDto = { email: "nonexistent@example.com", password: "password" };

      userRepository.findOne.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException("Invalid credentials")
      );
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      const loginDto: LoginDto = { email: "test@example.com", password: "wrongpassword" };
      const user = buildUser({
        email: loginDto.email,
        password: await bcrypt.hash("correctpassword", 10),
      });

      userRepository.findOne.mockResolvedValue(user);

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException("Invalid credentials")
      );
    });

    it("should throw UnauthorizedException for inactive user", async () => {
      const loginDto: LoginDto = { email: "test@example.com", password: "password123" };
      const inactiveUser = buildUser({
        email: loginDto.email,
        isActive: false,
        password: await bcrypt.hash(loginDto.password, 10),
      });

      userRepository.findOne.mockResolvedValue(null); // findOne with isActive: true returns null

      await expect(authService.login(loginDto)).rejects.toThrow(
        new UnauthorizedException("Invalid credentials")
      );
    });
  });

  describe("getProfile", () => {
    it("should return user profile with contracts", async () => {
      const userId = 1;
      const user = buildUser({ id: userId, contracts: [] });

      userRepository.findOne.mockResolvedValue(user);

      const result = await authService.getProfile(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId, isActive: true },
        relations: ["contracts", "contracts.rate"],
      });
      expect(result).toEqual(
        expect.objectContaining({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          contracts: [],
        })
      );
      expect(result).not.toHaveProperty("password");
    });

    it("should throw UnauthorizedException for non-existent user", async () => {
      const userId = 999;

      userRepository.findOne.mockResolvedValue(null);

      await expect(authService.getProfile(userId)).rejects.toThrow(
        new UnauthorizedException("User not found")
      );
    });
  });
});
