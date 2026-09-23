import { z } from "zod";

export const opportunitySchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  status: z.string(),
  apr: z.number(),
  totalApr: z.number(),
  tvl: z.number(),
  chainId: z.number(),
  chain: z.looseObject({
    id: z.number(),
    name: z.string(),
  }),
  protocol: z.looseObject({
    id: z.string(),
    name: z.string(),
  }),
});

export const opportunityListSchema = z.array(opportunitySchema);

export const opportunityCountSchema = z.number();

export const tvlRecordSchema = z.looseObject({
  total: z.number(),
});

export const tvlRecordListSchema = z.array(tvlRecordSchema);

export type Opportunity = z.infer<typeof opportunitySchema>;
export type TvlRecord = z.infer<typeof tvlRecordSchema>;
