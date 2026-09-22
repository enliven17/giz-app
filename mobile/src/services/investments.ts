import type { InvestmentSnapshot } from "@/domain/investments";
import { investmentFixture } from "./fixtures/investments";
export interface InvestmentService {
  load(): Promise<InvestmentSnapshot>;
}
export class OfflineError extends Error {}
export const demoInvestmentService: InvestmentService = {
  async load() {
    return JSON.parse(JSON.stringify(investmentFixture)) as InvestmentSnapshot;
  },
};
