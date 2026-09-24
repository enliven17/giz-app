import type { Cache } from "../../ports/cache.port.ts";
import type {
  Opportunities,
  OpportunityDetail,
} from "../../ports/opportunities.port.ts";

export class GetOpportunityUseCase {
  constructor(
    private readonly opportunities: Opportunities,
    private readonly cache: Cache,
  ) {}

  async execute(id: string): Promise<OpportunityDetail> {
    const cacheKey = `opportunities:detail:${id}`;
    const cached = await this.cache.get<OpportunityDetail>(cacheKey);
    if (cached !== null) {
      return cached;
    }
    const detail = await this.opportunities.getById(id);
    await this.cache.set(cacheKey, detail);
    return detail;
  }
}
