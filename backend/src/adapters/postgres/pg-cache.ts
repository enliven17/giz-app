import type { Pool } from "pg";
import type { Cache } from "../../ports/cache.port.ts";

const CACHE_TTL = "5 minutes";

export class PgCache implements Cache {
  private schemaReady = false;

  constructor(private readonly pool: Pool) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      await this.ensureSchema();
      const result = await this.pool.query(
        `
          select body
          from response_cache
          where cache_key = $1
            and expires_at > now()
        `,
        [key],
      );
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      if (row === undefined) {
        return null;
      }
      return row.body as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    try {
      await this.ensureSchema();
      await this.pool.query(
        `
          insert into response_cache (cache_key, body, expires_at)
          values ($1, $2::jsonb, now() + $3::interval)
          on conflict (cache_key) do update
          set body = excluded.body,
              expires_at = excluded.expires_at
        `,
        [key, JSON.stringify(value), CACHE_TTL],
      );
    } catch {
      return;
    }
  }

  async deleteExpired(): Promise<number> {
    try {
      await this.ensureSchema();
      const result = await this.pool.query(
        `
          delete from response_cache
          where expires_at <= now()
        `,
      );
      if (result.rowCount === null) {
        return 0;
      }
      return result.rowCount;
    } catch {
      return 0;
    }
  }

  private async ensureSchema(): Promise<void> {
    if (this.schemaReady) {
      return;
    }
    await this.pool.query(`
      create table if not exists response_cache (
        cache_key text primary key,
        body jsonb not null,
        expires_at timestamptz not null
      )
    `);
    await this.pool.query(`
      create index if not exists response_cache_expires_at_idx
      on response_cache (expires_at)
    `);
    this.schemaReady = true;
  }
}
