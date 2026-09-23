import type { FastifyReply, FastifyRequest } from "fastify";
import type { CheckDatabaseHealthUseCase } from "../../usecase/health/check-database-health.usecase.ts";
import { HealthResponseDto } from "./health.dto.ts";

export class HealthController {
  constructor(
    private readonly checkDatabaseHealth: CheckDatabaseHealthUseCase,
  ) {}

  check = async (_request: FastifyRequest, reply: FastifyReply) => {
    const response = await this.checkDatabaseHealth.execute();
    return reply.code(200).send(
      HealthResponseDto.create({
        result: {
          status: response.status,
        },
      }),
    );
  };
}
