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
  resolve("supabase/migrations/20260911000008_pickup_holds_stock_alerts.sql"),
  "utf8"
);

await sql.unsafe(migration);
await sql.unsafe("NOTIFY pgrst, 'reload schema'");

const tables = await sql`
  select table_name from information_schema.tables
  where table_schema = 'public'
    and table_name in ('pickup_holds', 'stock_alerts')
  order by 1
`;
console.log(
  "tables:",
  tables.map((r) => r.table_name).join(", ") || "(none)"
);

await sql.end();
