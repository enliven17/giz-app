import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { DomainError } from "../domain/errors/domain-error.ts";
import { InfrastructureError } from "../domain/errors/infrastructure-error.ts";

export function mapRequestError(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (error instanceof DomainError) {
    return reply.code(400).send({ code: error.code, message: error.message });
  }
  if (error instanceof InfrastructureError) {
    request.log.error(error);
    return reply
      .code(error.statusCode)
      .send({ code: error.code, message: error.message });
  }
  if (error instanceof ZodError || error.validation) {
    request.log.error(error);
    return reply
      .code(400)
      .send({ code: "VALIDATION_ERROR", message: "invalid request" });
  }
  request.log.error(error);
  return reply
    .code(500)
    .send({ code: "INTERNAL_ERROR", message: "unexpected error" });
}
