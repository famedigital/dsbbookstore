# DSB Book Store

Luxury digital catalogue + **complete staff/owner ERP** for DSB Books (Thimphu, Bhutan).

## What you get

| Surface | Purpose |
| --- | --- |
| `/` public site | Catalogue, search, availability, enquiries |
| `/erp` | Full ERP for staff & owners |

### ERP modules
Dashboard · POS · Orders · Catalogue · Inventory (stock ledger) · Purchasing · Customers · Enquiries · Finance · Publishing · Reports · Staff · Settings

Roles: **owner** · **manager** · **staff** (see `docs/03-erp-suite.md`)

## Stack
Next.js · shadcn/ui · Supabase · Cloudinary · Vercel  
Theme: premium Blue / Yellow / Green  
**No mock data** — live Supabase only from first code.

## Docs
- [Competitive research](./docs/01-competitive-research.md)
- [Product & tech plan](./docs/02-complete-product-tech-plan.md)
- [ERP suite](./docs/03-erp-suite.md)

## Setup

1. Create a Supabase project.
2. Run SQL in `supabase/migrations/20260723000001_erp_core.sql` (SQL editor or CLI).
3. Create an Auth user, then set `profiles.role` to `owner` (or `manager` / `staff`).
4. Copy `.env.example` → `.env.local` and fill keys.
5. Optional: Cloudinary cloud name for covers.
6. `npm install && npm run dev`
7. Open `/erp/login` and `/`.

```bash
npm install
npm run dev
```

## Deploy
Push to GitHub → import on Vercel → set the same env vars → apply migration on Supabase.
