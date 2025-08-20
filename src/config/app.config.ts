import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 3000,
  jwtSecret: process.env.JWT_SECRET || "dev-secret-key-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "24h",
}));
