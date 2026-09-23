import Fastify, {
  type FastifyInstance,
  type FastifyServerOptions,
} from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "@fastify/type-provider-zod";
import { HttpMerklOpportunities } from "./adapters/merkl/http-merkl-opportunities.ts";
import { PgDatabaseProbe } from "./adapters/postgres/pg-database-probe.ts";
import { createPgPool } from "./adapters/postgres/pg-pool.ts";
import type { ApiEnv } from "./env.schema.ts";
import { HealthController } from "./http/controllers/health.controller.ts";
import { OpportunitiesController } from "./http/controllers/opportunities.controller.ts";
import { mapRequestError } from "./http/map-request-error.ts";
import { registerHealthRoutes } from "./http/routes/health.routes.ts";
import { registerOpportunityRoutes } from "./http/routes/opportunities.routes.ts";
import { CheckDatabaseHealthUseCase } from "./usecase/health/check-database-health.usecase.ts";
import { GetOpportunityTvlRecordsUseCase } from "./usecase/opportunities/get-opportunity-tvl-records.usecase.ts";
import { ListOpportunitiesUseCase } from "./usecase/opportunities/list-opportunities.usecase.ts";

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
  const opportunities = new HttpMerklOpportunities(
    secret.MERKL_API_URL,
    secret.MERKL_API_KEY,
  );
  registerOpportunityRoutes(
    app,
    new OpportunitiesController(
      new ListOpportunitiesUseCase(opportunities),
      new GetOpportunityTvlRecordsUseCase(opportunities),
    ),
  );
  app.setErrorHandler(mapRequestError);

  app.addHook("onClose", async () => {
    await pgPool.end();
  });

  return app;
}
