import assert from "node:assert/strict";
import { test } from "node:test";
import { InfrastructureError } from "../../../src/domain/errors/infrastructure-error.ts";
import { CheckDatabaseHealthUseCase } from "../../../src/usecase/health/check-database-health.usecase.ts";

test("returns ok when the database answers", async () => {
  const useCase = new CheckDatabaseHealthUseCase({
    ping: async () => undefined,
  });
  const result = await useCase.execute();
  assert.deepEqual(result, { status: "ok" });
});

test("surfaces database unavailability", async () => {
  const useCase = new CheckDatabaseHealthUseCase({
    ping: async () => {
      throw new InfrastructureError(
        503,
        "DATABASE_UNAVAILABLE",
        "database unavailable",
      );
    },
  });
  await assert.rejects(
    () => useCase.execute(),
    (err: unknown) =>
      err instanceof InfrastructureError &&
      err.code === "DATABASE_UNAVAILABLE" &&
      err.statusCode === 503,
  );
});
