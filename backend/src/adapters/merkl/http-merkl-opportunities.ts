import { InfrastructureError } from "../../domain/errors/infrastructure-error.ts";
import type {
  ListOpportunitiesQuery,
  Opportunities,
  OpportunityPage,
  TvlRecordsQuery,
} from "../../ports/opportunities.port.ts";
import {
  opportunityCountSchema,
  opportunityListSchema,
  tvlRecordListSchema,
  type Opportunity,
  type TvlRecord,
} from "./merkl-opportunity.schema.ts";

export class HttpMerklOpportunities implements Opportunities {
  constructor(
    private readonly apiUrl: string,
    private readonly apiKey: string,
  ) {}

  async list(query: ListOpportunitiesQuery): Promise<OpportunityPage> {
    const headers = { "X-API-Key": this.apiKey };
    const listUrl = new URL("/v4/opportunities", this.apiUrl);
    listUrl.searchParams.set("page", String(query.page));
    listUrl.searchParams.set("items", String(query.items));
    listUrl.searchParams.set("chainId", String(query.chainId));
    const countUrl = new URL("/v4/opportunities/count", this.apiUrl);
    countUrl.searchParams.set("chainId", String(query.chainId));
    if (query.search.length > 0) {
      listUrl.searchParams.set("search", query.search);
      countUrl.searchParams.set("search", query.search);
    }

    let listResponse: Response;
    let countResponse: Response;
    try {
      [listResponse, countResponse] = await Promise.all([
        fetch(listUrl, { headers }),
        fetch(countUrl, { headers }),
      ]);
    } catch (err) {
      throw new InfrastructureError(503, "MERKL_UNAVAILABLE", "merkl unavailable", {
        cause: err,
      });
    }
    if (!listResponse.ok || !countResponse.ok) {
      throw new InfrastructureError(503, "MERKL_UNAVAILABLE", "merkl unavailable", {
        cause: new Error(`merkl status ${listResponse.status} ${countResponse.status}`),
      });
    }

    const listBody: unknown = await listResponse.json();
    const countBody: unknown = await countResponse.json();
    const listParsed = opportunityListSchema.safeParse(listBody);
    const countParsed = opportunityCountSchema.safeParse(countBody);
    if (!listParsed.success || !countParsed.success) {
      let cause: unknown = listParsed;
      if (listParsed.success) {
        cause = countParsed;
      }
      throw new InfrastructureError(503, "MERKL_UNAVAILABLE", "merkl unavailable", {
        cause,
      });
    }

    const list: Opportunity[] = listParsed.data;
    return { list, total: countParsed.data };
  }

  async tvlRecords(query: TvlRecordsQuery): Promise<TvlRecord[]> {
    const url = new URL(`/v4/opportunities/${query.id}/tvl-records`, this.apiUrl);
    url.searchParams.set("page", "0");
    url.searchParams.set("items", String(query.items));

    let response: Response;
    try {
      response = await fetch(url, { headers: { "X-API-Key": this.apiKey } });
    } catch (err) {
      throw new InfrastructureError(503, "MERKL_UNAVAILABLE", "merkl unavailable", {
        cause: err,
      });
    }
    if (!response.ok) {
      throw new InfrastructureError(503, "MERKL_UNAVAILABLE", "merkl unavailable", {
        cause: new Error(`merkl status ${response.status}`),
      });
    }

    const body: unknown = await response.json();
    const parsed = tvlRecordListSchema.safeParse(body);
    if (!parsed.success) {
      throw new InfrastructureError(503, "MERKL_UNAVAILABLE", "merkl unavailable", {
        cause: parsed,
      });
    }
    return parsed.data;
  }
}
