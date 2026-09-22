import { dollars, filterVaults, periodSeries, portfolioTotal } from "@/domain/investments";
import { investmentFixture } from "@/services/fixtures/investments";
test("formats exact cent totals beyond floating point precision", () => {
  expect(dollars("900719925474099301")).toBe("$9,007,199,254,740,993.01");
  expect(dollars("-101")).toBe("-$1.01");
  expect(portfolioTotal(investmentFixture.holdings)).toBe("$810,838.24");
});
test.each(["helix", "HLX", "BASIS", " Helix Capital "])("search matches %s", (query) => {
  expect(filterVaults(investmentFixture.vaults, query, "All").map((v) => v.id)).toEqual(["helix"]);
});
test("periods select deterministic distinct history windows", () => {
  const s = investmentFixture.portfolioSeries;
  expect(periodSeries(s, "1W")).toEqual(s.slice(-16));
  expect(periodSeries(s, "All")).toEqual(s);
});
