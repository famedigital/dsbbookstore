import { createClient } from "@supabase/supabase-js";
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const XLSX = require("xlsx");

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
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } }
);

const { count: total } = await supabase
  .from("books")
  .select("*", { count: "exact", head: true });
const { count: withBarcode } = await supabase
  .from("books")
  .select("*", { count: "exact", head: true })
  .not("barcode", "is", null);
const { count: withBrand } = await supabase
  .from("books")
  .select("*", { count: "exact", head: true })
  .not("brand", "is", null);
const { count: withOpening } = await supabase
  .from("books")
  .select("*", { count: "exact", head: true })
  .gt("opening_qty", 0);

const { data: sample } = await supabase
  .from("books")
  .select(
    "title, brand, cost_price_btn, price_btn, opening_qty, stock_qty, clo_val_btn, barcode"
  )
  .eq("barcode", "9780944142396")
  .maybeSingle();

const wb = XLSX.readFile(resolve("docs/Stock Register 31-12-25.xlsx"));
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
  header: 1,
  defval: null,
});
const excel = rows.find((r) => String(r?.[25] || "").trim() === "9780944142396");

console.log({
  total,
  withBarcode,
  withBrand,
  withOpening,
  dbSample: sample,
  excelSample: excel
    ? {
        product: excel[0],
        brand: excel[4],
        pur: excel[17],
        sal: excel[18],
        opening: excel[19],
        closing: excel[20],
        cloVal: excel[22],
        upcean: excel[25],
      }
    : null,
});
