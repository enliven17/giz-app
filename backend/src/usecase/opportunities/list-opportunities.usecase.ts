import type {
  ListOpportunitiesQuery,
  Opportunities,
  OpportunityPage,
} from "../../ports/opportunities.port.ts";

export class ListOpportunitiesUseCase {
  constructor(private readonly opportunities: Opportunities) {}

  async execute(input: ListOpportunitiesQuery): Promise<OpportunityPage> {
    return this.opportunities.list(input);
  }
}
