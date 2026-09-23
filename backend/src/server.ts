import { buildApp } from "./app.ts";
import { parseApiEnv } from "./env.schema.ts";
import { resolveEnv } from "./secret/env-file.ts";

const Secret = parseApiEnv(resolveEnv());

try {
  const app = await buildApp(Secret);
  await app.listen({ port: Secret.PORT, host: "0.0.0.0" });
} catch (err) {
  if (err instanceof Error) {
    console.error(err.message);
  } else {
    console.error(err);
  }
  process.exit(1);
}
