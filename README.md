# DSB Book Store

Online digital catalogue for **DSB Books / DSB Publication** (Thimphu, Bhutan) — search, browse, check availability, and manage books, authors, pricing, inventory, and enquiries. Path to online sales in Phase 2.

## Status

Planning complete. Implementation not started.

## Docs

- [Documentation index](./docs/README.md)
- [Competitive research](./docs/01-competitive-research.md)
- [Complete product & tech plan](./docs/02-complete-product-tech-plan.md)

## Planned stack

| Layer | Choice |
| --- | --- |
| UI | shadcn/ui (all primitives & theme tokens) |
| Brand colors | Premium Blue · Yellow · Green |
| App | Next.js (App Router) + TypeScript |
| Hosting | Vercel |
| Data / Auth | Supabase (Postgres + RLS) — **no mock data** |
| Images | Cloudinary (adaptive `f_auto,q_auto`) |

## Phased delivery

1. **Living Catalogue** — public browse/search/availability + admin + enquiries  
2. **Commerce** — cart, checkout, pickup/delivery, Bhutan-ready payments  
3. **Growth** — accounts, events, deeper content & analytics  
