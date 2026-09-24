import type { Cache } from "../../ports/cache.port.ts";

export class PurgeExpiredCacheUseCase {
  constructor(private readonly cache: Cache) {}

  async execute(): Promise<number> {
    return this.cache.deleteExpired();
  }
}
