import { config } from "dotenv";
import { join } from "node:path";

export function resolveEnv(directory: string = process.cwd()): NodeJS.ProcessEnv {
  const loaded = config({ path: join(directory, ".env"), quiet: true });
  if (loaded.error) {
    throw loaded.error;
  }
  return process.env;
}
