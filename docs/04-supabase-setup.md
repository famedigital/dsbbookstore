# Supabase connection notes (DSB)

## Dashboard account (keep this)
- **Email:** `booksilverpine@gmail.com`
- Use this email for [supabase.com/dashboard](https://supabase.com/dashboard) login and password reset.
- Secrets (DB password, anon/service keys) live in Vercel env + local `.env.local` only — **never commit them**.

## Project
- Ref: `ocyssouzbglndkrdccxi`
- URL: `https://ocyssouzbglndkrdccxi.supabase.co`
- Region: `ap-southeast-1` (Singapore)
- Direct DB host (IPv6): `db.ocyssouzbglndkrdccxi.supabase.co:5432`
- Pooler (IPv4-friendly): `aws-0-ap-southeast-1.pooler.supabase.com:6543` with user `postgres.ocyssouzbglndkrdccxi`

### Previous project (deleted / unreachable)
- Ref: `ksbkbedekzsgqxrvcjus` — DNS no longer resolves; do not use.

## What to apply on a fresh project
- ERP schema migration: `supabase/migrations/20260723000001_erp_core.sql` (and any later migrations under `supabase/migrations/`)
- Owner Auth user + `public.profiles.role = 'owner'`
- Sample catalogue seed: `npm run db:seed` (runs `scripts/seed-sample-books.mjs` / `supabase/seed.sql`)

## Local env
Copy from Vercel or the team password manager into `.env.local` (gitignored):

| Variable | Notes |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ocyssouzbglndkrdccxi.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Legacy anon JWT or publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role JWT (server only) |
| `DATABASE_URL` | Pooler: `postgresql://postgres.ocyssouzbglndkrdccxi:…@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres` |
| `NEXT_PUBLIC_SITE_URL` | Local: `http://localhost:3000` |

## CLI link (optional)
`supabase link` needs a **personal access token** (Dashboard → Account → Access Tokens), created while logged in as `booksilverpine@gmail.com`:

```bash
npx supabase login --token "$SUPABASE_ACCESS_TOKEN"
npx supabase link --project-ref ocyssouzbglndkrdccxi --password "$DB_PASSWORD"
```

If link is unavailable, apply SQL with `psql` against `DATABASE_URL`.

## Owner login (ERP bootstrap)
- Email: `dsb.owner@gmail.com`
- Password: see team password manager / `SEED_OWNER_PASSWORD` in `.env.local`
- Role: `public.profiles.role = 'owner'`
- App URL: `/erp/login`
