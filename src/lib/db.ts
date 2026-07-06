import "server-only";
import postgres from "postgres";

// Postgres connection for the data layer. Connects to the shared Supabase
// project through the transaction pooler as the dedicated role dfr_app, which
// can only touch the deepfake_recourse schema. The password comes from the
// environment and is never exposed client-side.

const PROJECT_REF = "djyzqifuckuwdeeltnej";
const DEFAULT_POOLER_HOST = "aws-0-us-east-1.pooler.supabase.com";

const globalForDb = globalThis as unknown as {
  __dfrSql?: ReturnType<typeof postgres>;
};

export function sql(): ReturnType<typeof postgres> {
  if (!globalForDb.__dfrSql) {
    const password = process.env.DFR_DB_PASSWORD;
    if (!password) {
      throw new Error("DFR_DB_PASSWORD is not configured on the server.");
    }
    globalForDb.__dfrSql = postgres({
      host: process.env.DFR_DB_HOST ?? DEFAULT_POOLER_HOST,
      port: Number(process.env.DFR_DB_PORT ?? 6543),
      database: "postgres",
      username: `dfr_app.${PROJECT_REF}`,
      password,
      ssl: "require",
      // Transaction-pooling mode does not support prepared statements.
      prepare: false,
      // Serverless-friendly: small pool, short idle.
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return globalForDb.__dfrSql;
}
