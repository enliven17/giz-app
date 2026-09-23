import type { FastifyInstance } from "fastify";
import type { HealthController } from "../controllers/health.controller.ts";

export function registerHealthRoutes(
  app: FastifyInstance,
  controller: HealthController,
) {
  app.get("/v1/health", controller.check);
}
