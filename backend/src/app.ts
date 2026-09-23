import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "@fastify/type-provider-zod";
import { PgDatabaseProbe } from "./adapters/postgres/pg-database-probe.ts";
import { createPgPool } from "./adapters/postgres/pg-pool.ts";
import type { ApiEnv } from "./env.schema.ts";
import { HealthController } from "./http/controllers/health.controller.ts";
import { mapRequestError } from "./http/map-request-error.ts";
import { registerHealthRoutes } from "./http/routes/health.routes.ts";
import { CheckDatabaseHealthUseCase } from "./usecase/health/check-database-health.usecase.ts";

export async function buildApp(secret: ApiEnv): Promise<FastifyInstance> {
  let loggerOptions: FastifyServerOptions["logger"] = {
    level: "info",
  };
  if (secret.NODE_ENV === "local") {
    loggerOptions = {
      level: "info",
      transport: { target: "pino-pretty" },
    };
  }
  if (secret.NODE_ENV === "test") {
    loggerOptions = false;
  }

  const app = Fastify({
    logger: loggerOptions,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const pgPool = createPgPool(secret.DATABASE_URL);
  const healthController = new HealthController(
    new CheckDatabaseHealthUseCase(new PgDatabaseProbe(pgPool)),
  );

  registerHealthRoutes(app, healthController);
  app.setErrorHandler(mapRequestError);

  app.addHook("onClose", async () => {
    await pgPool.end();
  });

  return app;
}
