import fs from "fs";
import { Client } from "pg";

const env = fs.readFileSync(".env.local", "utf8");
const m = env.match(/^DATABASE_URL=(.*)$/m);
if (!m) throw new Error("no DATABASE_URL");

const sql = fs.readFileSync(
  "supabase/migrations/20260910000002_store_profile_receipt_print.sql",
  "utf8"
);

const c = new Client({
  connectionString: m[1].trim(),
  ssl: { rejectUnauthorized: false },
});
await c.connect();
await c.query(sql);
await c.query("NOTIFY pgrst, 'reload schema'");
const r = await c.query(
  `select column_name from information_schema.columns
   where table_schema='public' and table_name='store_settings'
   and column_name in ('public_tagline','visit_directions','bank_qr_image_url')
   order by 1`
);
console.log("ok columns:", r.rows.map((x) => x.column_name).join(", "));
await c.end();
