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

const items = [
  {
    title: "Blue Ballpoint Pen",
    slug: "blue-ballpoint-pen",
    barcode: "8901001000012",
    price: 25,
    cost: 10,
    stock: 100,
    description: "Smooth writing ballpoint for daily use.",
  },
  {
    title: "A4 Exercise Book",
    slug: "a4-exercise-book",
    barcode: "8901001000029",
    price: 45,
    cost: 20,
    stock: 60,
    description: "Ruled exercise book for school and office.",
  },
  {
    title: "HB Pencil Pack (12)",
    slug: "hb-pencil-pack-12",
    barcode: "8901001000036",
    price: 80,
    cost: 35,
    stock: 40,
    description: "Pack of twelve HB pencils.",
  },
  {
    title: "Glue Stick 15g",
    slug: "glue-stick-15g",
    barcode: "8901001000043",
    price: 35,
    cost: 15,
    stock: 50,
    description: "Non-toxic glue stick for paper crafts.",
  },
];

const client = new pg.Client({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  for (const item of items) {
    await client.query(
      `insert into public.books (
         title, slug, description, barcode, product_kind, format,
         price_btn, cost_price_btn, stock_qty, availability_status,
         is_published, publisher_name, language
       ) values ($1,$2,$3,$4,'stationery','unit',$5,$6,$7,'in_stock',true,'DSB Books','English')
       on conflict (slug) do update set
         product_kind = 'stationery',
         barcode = excluded.barcode,
         price_btn = excluded.price_btn,
         stock_qty = excluded.stock_qty,
         is_published = true,
         updated_at = now()`,
      [
        item.title,
        item.slug,
        item.description,
        item.barcode,
        item.price,
        item.cost,
        item.stock,
      ]
    );
  }
  const { rows } = await client.query(
    `select product_kind::text, count(*)::int as n from public.books group by 1 order by 1`
  );
  console.log("seeded_stationery", rows);
} finally {
  await client.end();
}
