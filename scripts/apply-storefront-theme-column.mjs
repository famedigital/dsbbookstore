import { createClient } from "@supabase/supabase-js";
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

// Prefer postgres.js if DATABASE_URL is present
const databaseUrl = process.env.DATABASE_URL;
if (databaseUrl) {
  const postgres = (await import("postgres")).default;
  const sql = postgres(databaseUrl, { ssl: "require", max: 1 });
  await sql`
    alter table public.store_settings
      add column if not exists storefront_theme text not null default 'uikit'
  `;
  await sql`
    update public.store_settings
       set storefront_theme = 'uikit'
     where id = 1 and (storefront_theme is null or storefront_theme = '')
  `;
  const rows = await sql`select storefront_theme from public.store_settings where id = 1`;
  console.log("OK storefront_theme =", rows[0]?.storefront_theme);
  await sql.end();
  process.exit(0);
}

// Fallback: verify column via select (migration may already be applied)
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await supabase
  .from("store_settings")
  .select("storefront_theme")
  .eq("id", 1)
  .maybeSingle();

if (error) {
  console.error(
    "Column missing — set DATABASE_URL and re-run, or apply supabase/migrations/20260910000001_storefront_theme.sql",
  );
  console.error(error.message);
  process.exit(1);
}

console.log("OK storefront_theme =", data?.storefront_theme ?? "uikit");
