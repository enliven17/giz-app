import type {
  Opportunities,
  OpportunityDetail,
} from "../../ports/opportunities.port.ts";

export class GetOpportunityUseCase {
  constructor(private readonly opportunities: Opportunities) {}

  async execute(id: string): Promise<OpportunityDetail> {
    return this.opportunities.getById(id);
  }
}
