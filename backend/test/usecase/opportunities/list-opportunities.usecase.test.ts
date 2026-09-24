import assert from "node:assert/strict";
import { test } from "node:test";
import { ListOpportunitiesUseCase } from "../../../src/usecase/opportunities/list-opportunities.usecase.ts";

test("returns the page unchanged", async () => {
  const opportunity = {
    id: "1",
    name: "Lend USDC on Aave",
    status: "LIVE",
    apr: 4.75,
    totalApr: 4.75,
    tvl: 10,
    chainId: 143,
    chain: { id: 143, name: "Monad" },
    protocol: { id: "aave", name: "Aave" },
  };
  const useCase = new ListOpportunitiesUseCase({
    list: async () => ({ list: [opportunity], total: 1 }),
    getById: async () => {
      throw new Error("unused");
    },
    tvlRecords: async () => [],
  });
  const result = await useCase.execute({
    search: "USDC",
    page: 0,
    items: 20,
    chainId: 143,
  });
  assert.equal(result.total, 1);
  assert.equal(result.list.length, 1);
  assert.equal(result.list[0], opportunity);
});
