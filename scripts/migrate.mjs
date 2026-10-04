// Applies db/migrations/*.sql in order. Safe to re-run: every statement is
// idempotent and applied files are recorded in schema_migrations.
// Skips quietly when no database URL is set (local builds, previews without a database).
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.log("migrate: no DATABASE_URL set, skipping");
  process.exit(0);
}

const sql = neon(url);
const dir = path.join(import.meta.dirname, "..", "db", "migrations");

await sql.query("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
const done = new Set((await sql.query("SELECT name FROM schema_migrations")).map((r) => r.name));

for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  if (done.has(file)) continue;
  const statements = readFileSync(path.join(dir, file), "utf8")
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const statement of statements) await sql.query(statement);
  await sql.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
  console.log(`migrate: applied ${file}`);
}
console.log("migrate: up to date");
