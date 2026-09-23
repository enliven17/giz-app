import type {
  Opportunities,
  TvlRecord,
  TvlRecordsQuery,
} from "../../ports/opportunities.port.ts";

export class GetOpportunityTvlRecordsUseCase {
  constructor(private readonly opportunities: Opportunities) {}

  async execute(input: TvlRecordsQuery): Promise<TvlRecord[]> {
    return this.opportunities.tvlRecords(input);
  }
}
