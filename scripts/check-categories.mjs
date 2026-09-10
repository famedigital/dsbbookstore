import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const raw = readFileSync(resolve(".env.local"), "utf8");
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  )
    v = v.slice(1, -1);
  if (!process.env[m[1]]) process.env[m[1]] = v;
}

const s = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } }
);

const { data: cats } = await s.from("categories").select("id,name,slug");
console.log(
  "categories:",
  (cats || []).map((c) => c.name).join(" | ")
);
if (!(cats || []).some((c) => c.slug === "history-culture")) {
  const { error } = await s.from("categories").insert({
    name: "History & Culture",
    slug: "history-culture",
    sort_order: 60,
  });
  console.log("history create:", error?.message || "ok");
}
const { count } = await s
  .from("book_categories")
  .select("*", { count: "exact", head: true });
console.log("book_categories links:", count);
