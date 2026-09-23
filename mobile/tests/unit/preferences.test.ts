import { defaultPreferences, normalizePreferences } from "@/domain/preferences";
import { memoryPreferences } from "../support/account";
test.each([null, undefined, "USD", [], {}, { version: 2, alerts: true }])(
  "unknown preference schema defaults safely: %p",
  (input) => {
    expect(normalizePreferences(input)).toEqual(defaultPreferences);
  },
);
test("normalizes fields independently and never accepts unsupported currency or unknown data", () => {
  expect(
    normalizePreferences({
      version: 1,
      alerts: "true",
      currency: "TRY",
      statements: "Daily",
      secret: "ignored",
    }),
  ).toEqual(defaultPreferences);
  expect(normalizePreferences({ version: 1, alerts: true, statements: "Quarterly" })).toEqual({
    ...defaultPreferences,
    alerts: true,
    statements: "Quarterly",
  });
});
test("persists only normalized preferences and clears only the selected account", async () => {
  const { store, storage } = memoryPreferences();
  await store.save("a", { ...defaultPreferences, alerts: true, statements: "On request" });
  await store.save("b", { ...defaultPreferences, statements: "Quarterly" });
  expect(await store.load("a")).toEqual({
    ...defaultPreferences,
    alerts: true,
    statements: "On request",
  });
  await store.clear("a");
  expect(await store.load("a")).toEqual(defaultPreferences);
  expect((await store.load("b")).statements).toBe("Quarterly");
  storage.getItem.mockResolvedValueOnce("{broken");
  expect(await store.load("b")).toEqual(defaultPreferences);
});
