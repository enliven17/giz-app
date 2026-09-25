import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { z } from "zod";
import type { OpportunitiesController } from "../controllers/opportunities.controller.ts";

export const ListOpportunitiesQuerySchema = z.object({
  search: z.string(),
  page: z.coerce.number().int().nonnegative(),
  items: z.coerce.number().int().positive(),
  chainId: z.coerce.number().int().positive(),
});

export type ListOpportunitiesQuery = z.infer<typeof ListOpportunitiesQuerySchema>;

export const OpportunityParamsSchema = z.object({
  id: z.string().min(1),
});

export type OpportunityParams = z.infer<typeof OpportunityParamsSchema>;

export const TvlRecordsParamsSchema = OpportunityParamsSchema;

export const TvlRecordsQuerySchema = z.object({
  items: z.coerce.number().int().positive(),
});

export type TvlRecordsParams = z.infer<typeof TvlRecordsParamsSchema>;
export type TvlRecordsQuery = z.infer<typeof TvlRecordsQuerySchema>;

export function registerOpportunityRoutes(
  app: FastifyInstance,
  controller: OpportunitiesController,
) {
  const server = app.withTypeProvider<ZodTypeProvider>();
  server.get(
    "/v1/opportunities",
    { schema: { querystring: ListOpportunitiesQuerySchema } },
    controller.list,
  );
  server.get(
    "/v1/opportunities/:id/tvl-records",
    {
      schema: {
        params: TvlRecordsParamsSchema,
        querystring: TvlRecordsQuerySchema,
      },
    },
    controller.tvlRecords,
  );
  server.get(
    "/v1/opportunities/:id",
    { schema: { params: OpportunityParamsSchema } },
    controller.getById,
  );
}
