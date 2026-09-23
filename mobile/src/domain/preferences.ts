export type StatementFrequency = "Monthly" | "Quarterly" | "On request";
export type Preferences = {
  version: 1;
  alerts: boolean;
  currency: "USD";
  statements: StatementFrequency;
};
export const defaultPreferences: Preferences = {
  version: 1,
  alerts: false,
  currency: "USD",
  statements: "Monthly",
};
export function normalizePreferences(value: unknown): Preferences {
  if (!value || typeof value !== "object" || !("version" in value) || value.version !== 1)
    return { ...defaultPreferences };
  const stored = value as Record<string, unknown>;
  return {
    ...defaultPreferences,
    alerts: typeof stored.alerts === "boolean" ? stored.alerts : false,
    statements:
      stored.statements === "Quarterly" || stored.statements === "On request"
        ? stored.statements
        : "Monthly",
  };
}
