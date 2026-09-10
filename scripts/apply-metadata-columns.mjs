import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const raw = readFileSync(resolve(".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

loadEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const postgres = (await import("postgres")).default;
const sql = postgres(databaseUrl, { ssl: "require", max: 1 });
const migration = readFileSync(
  resolve("supabase/migrations/20260910000007_book_metadata_enrichment.sql"),
  "utf8"
);

await sql.unsafe(migration);
await sql.unsafe("NOTIFY pgrst, 'reload schema'");

const cols = await sql`
  select column_name from information_schema.columns
  where table_schema = 'public' and table_name = 'books'
    and column_name in ('metadata_source','metadata_enriched_at')
  order by 1
`;
console.log(
  "books metadata cols:",
  cols.map((r) => r.column_name).join(", ") || "(none)"
);

await sql.end();
