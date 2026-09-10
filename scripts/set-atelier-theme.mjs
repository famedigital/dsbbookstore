import fs from "fs";
import pg from "pg";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, "")];
    })
);

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();
await client.query(
  `update public.store_settings set storefront_theme = 'atelier' where id = 1`
);
const { rows } = await client.query(
  `select storefront_theme from public.store_settings where id = 1`
);
console.log(rows[0]);
await client.end();
