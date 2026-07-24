# DSB Book Store

Luxury digital catalogue + **staff/owner ERP** for DSB Books (Thimphu, Bhutan).

## What you get

| Surface | Purpose |
| --- | --- |
| `/` public site | Catalogue, authors, search, availability, enquiries |
| `/erp` | ERP for staff & owners |

### ERP modules
Dashboard · POS · Orders · Catalogue · Inventory · Purchasing · Customers · Enquiries · Finance · Publishing · Reports · Staff · Settings

Roles: **owner** · **manager** · **staff** (see [docs/03-erp-suite.md](./docs/03-erp-suite.md))

## Stack
Next.js · shadcn/ui · Supabase · Cloudinary · Vercel  
Theme: premium Blue / Yellow / Green  
**No mock data** — live Supabase only.

## Getting started

1. **Clone and install**
   ```bash
   npm install
   cp .env.example .env.local
   ```

2. **Supabase** — create a project and run the migration:
   ```bash
   npm run db:migrate   # shows where to apply SQL
   ```
   Apply `supabase/migrations/20260723000001_erp_core.sql` in the SQL editor.

3. **Owner user** — create an Auth user, then set `profiles.role` to `owner` (see [docs/05-developer-guide.md](./docs/05-developer-guide.md)).

4. **Env** — fill `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and optional Cloudinary keys in `.env.local`.

5. **Run**
   ```bash
   npm run dev
   ```
   - Storefront: [http://localhost:3000](http://localhost:3000)
   - ERP login: [http://localhost:3000/erp/login](http://localhost:3000/erp/login)

## Documentation

| Doc | Topic |
| --- | --- |
| [Developer guide](./docs/05-developer-guide.md) | Setup, env, conventions, deploy |
| [ERP module map](./docs/06-erp-module-map.md) | Routes and permissions |
| [Implemented vs planned](./docs/07-implemented-vs-planned.md) | Feature status |
| [Full doc index](./docs/README.md) | All planning & technical docs |

## Deploy

Push to GitHub → import on Vercel → set env vars → apply migration on production Supabase → create owner profile.
