import "server-only";
import { Pool } from "pg";

declare global {
  var mbCouturePool: Pool | undefined;
}

export function getDatabasePool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!globalThis.mbCouturePool) {
    globalThis.mbCouturePool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
  }

  return globalThis.mbCouturePool;
}
