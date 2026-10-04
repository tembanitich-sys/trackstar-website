import { neon } from "@neondatabase/serverless";

export type Sql = ReturnType<typeof neon>;

/** Neon via the Vercel Marketplace sets DATABASE_URL (and POSTGRES_URL). */
export function getSql(): Sql {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

/** Runs a parameterised query and returns the rows as objects. */
export async function query(text: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  return (await getSql().query(text, params)) as Record<string, unknown>[];
}
