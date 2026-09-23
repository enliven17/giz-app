import type { DatabaseProbe } from "../../ports/database-probe.port.ts";

export class CheckDatabaseHealthUseCase {
  constructor(private readonly database: DatabaseProbe) {}

  async execute(): Promise<{ status: "ok" }> {
    await this.database.ping();
    return { status: "ok" };
  }
}
