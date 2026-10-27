import "server-only";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite, type PgliteDatabase } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Both drivers expose the same query-builder surface; PGlite's type is used for both.
export type Db = PgliteDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
export type DbOrTx = Db | Tx;

const MIGRATIONS = path.join(process.cwd(), "drizzle");

const globalForDb = globalThis as unknown as { __db?: Promise<Db>; __dbMigrations?: number; __dbMigrating?: Promise<void> };

/** Number of migrations on disk, so a long-running dev server notices new ones. */
function migrationCount(): number {
  try {
    const journal = JSON.parse(readFileSync(path.join(MIGRATIONS, "meta", "_journal.json"), "utf8")) as { entries: unknown[] };
    return journal.entries.length;
  } catch {
    return 0;
  }
}

/**
 * The postgres.js clients for production. Drizzle turns off postgres.js's own
 * JSON serialisation on the client it is given (it sends JSON as text itself);
 * the transaction pool must get the same settings, or everything written inside
 * a transaction is JSON-encoded twice and stored as a string.
 */
export function productionClients(url: string) {
  const options = { prepare: false, max_pipeline: 0, max: 10, idle_timeout: 20, max_lifetime: 60 * 10, connect_timeout: 10 };
  const client = postgres(url, options as Parameters<typeof postgres>[1]);
  // With max_pipeline 0, postgres.js never reserves the connection that runs
  // BEGIN, so every transaction fails with UNSAFE_TRANSACTION. Transactions
  // get their own small pool that can reserve; their queries are sequential.
  const txClient = postgres(url, { ...options, max: 5, max_pipeline: 1 } as Parameters<typeof postgres>[1]);
  // Share the type parsers and serialisers, so Drizzle's changes to `client`
  // (made when it wraps the client) apply to transactions too.
  txClient.options.parsers = client.options.parsers;
  txClient.options.serializers = client.options.serializers;
  client.begin = txClient.begin.bind(txClient) as typeof client.begin;
  return { client, txClient };
}

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    // Production Postgres (e.g. Supabase). Migrations run via `npm run db:migrate`.
    // Supabase's transaction pooler (Supavisor) can stall when several queries are
    // pipelined on one connection, which happens once pooled connections are warm.
    // So: one query in flight per connection, no prepared statements, and short
    // idle and connect timeouts so a dead serverless socket is never reused.
    // `max_pipeline` is a real postgres.js option that its type definitions omit.
    const { client } = productionClients(url);
    return drizzlePostgres({ client, schema }) as unknown as Db;
  }
  // Local development and tests: embedded Postgres, migrated on first use.
  const dataDir = process.env.PGLITE_DATA_DIR || path.join(process.cwd(), ".data", "pglite");
  if (!dataDir.includes("://")) mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzlePglite({ client, schema });
  await migratePglite(db, { migrationsFolder: MIGRATIONS });
  globalForDb.__dbMigrations = migrationCount();
  return db;
}

export async function getDb(): Promise<Db> {
  globalForDb.__db ??= connect().catch((err) => {
    // Don't cache a failed connection; the next request retries.
    globalForDb.__db = undefined;
    throw err;
  });
  const db = await globalForDb.__db;
  // Embedded dev database: apply migrations added while the server was running.
  if (!process.env.DATABASE_URL && migrationCount() !== globalForDb.__dbMigrations) {
    globalForDb.__dbMigrating ??= migratePglite(db, { migrationsFolder: MIGRATIONS })
      .then(() => void (globalForDb.__dbMigrations = migrationCount()))
      .finally(() => (globalForDb.__dbMigrating = undefined));
    await globalForDb.__dbMigrating;
  }
  return db;
}

export { schema };
