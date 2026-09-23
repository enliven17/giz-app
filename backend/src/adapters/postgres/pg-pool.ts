import pg from "pg";

const { Pool } = pg;

export function createPgPool(connectionString: string) {
  const pool = new Pool({
    connectionString,
    max: 10,
    connectionTimeoutMillis: 2_000,
    idleTimeoutMillis: 30_000,
    statement_timeout: 5_000,
  });
  pool.on("connect", (client) => {
    void client.query("set time zone 'UTC'");
  });
  return pool;
}
