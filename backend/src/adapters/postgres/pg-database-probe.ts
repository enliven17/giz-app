import type { Pool } from "pg";
import { InfrastructureError } from "../../domain/errors/infrastructure-error.ts";
import type { DatabaseProbe } from "../../ports/database-probe.port.ts";

export class PgDatabaseProbe implements DatabaseProbe {
  constructor(private readonly pool: Pool) {}

  async ping(): Promise<void> {
    try {
      await this.pool.query("select 1");
    } catch (err) {
      throw new InfrastructureError(
        503,
        "DATABASE_UNAVAILABLE",
        "database unavailable",
        { cause: err },
      );
    }
  }
}
