# Supabase connection notes (DSB)

## Project
- Ref: `ksbkbedekzsgqxrvcjus`
- URL: `https://ksbkbedekzsgqxrvcjus.supabase.co`
- Region pooler that works from this environment: `aws-0-ap-northeast-1.pooler.supabase.com`

## What was applied
- ERP schema migration: `supabase/migrations/20260723000001_erp_core.sql`
- Owner profile created and confirmed
- Sample published books seeded for catalogue smoke test

## Local env
Copy secrets into `.env.local` (gitignored). Never commit DB password or keys.

## CLI link (optional)
`supabase link` needs a **personal access token** (Dashboard → Account → Access Tokens):

```bash
export SUPABASE_ACCESS_TOKEN=sbp_xxx
npx supabase login
npx supabase link --project-ref ksbkbedekzsgqxrvcjus --password "$DB_PASSWORD"
```

If link is unavailable, apply SQL with `psql` against the pooler `DATABASE_URL` (already done once).

## Owner login (bootstrap)
Use the owner account created in Auth (see run notes / team password manager).  
Role is set in `public.profiles.role = 'owner'`.
