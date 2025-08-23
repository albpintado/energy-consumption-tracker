import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckService, MemoryHealthIndicator } from "@nestjs/terminus";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: "Check application health status" })
  @ApiResponse({
    status: 200,
    description: "Health check successful",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        info: {
          type: "object",
          properties: {
            memory_heap: {
              type: "object",
              properties: {
                status: { type: "string", example: "up" },
              },
            },
          },
        },
        error: { type: "object" },
        details: {
          type: "object",
          properties: {
            memory_heap: {
              type: "object",
              properties: {
                status: { type: "string", example: "up" },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: "Health check failed",
  })
  check() {
    return this.health.check([() => this.memory.checkHeap("memory_heap", 150 * 1024 * 1024)]);
  }
}
