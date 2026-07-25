# Developer guide

Practical setup for DSB Bookstore (`dsb-bookstore`).

## Prerequisites

- Node.js 20+
- npm
- Supabase project
- Optional: Cloudinary account for cover uploads

## Local setup

```bash
git clone <repo>
cd dsb-bookstore
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (storefront) and [http://localhost:3000/erp/login](http://localhost:3000/erp/login) (ERP).

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin scripts; never expose to client |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Covers | Public cloud name for `CldImage` / URLs |
| `CLOUDINARY_API_KEY` | Upload | Server-side signing |
| `CLOUDINARY_API_SECRET` | Upload | Server-side signing |
| `NEXT_PUBLIC_SITE_URL` | Deploy | Canonical site URL |

See `.env.example`. **No mock data** — pages show empty states when Supabase is unset.

## Database migration

Apply the core schema once per project:

```bash
npm run db:migrate   # prints reminder
```

Then run `supabase/migrations/20260723000001_erp_core.sql` in the Supabase SQL editor, or via `psql` / Supabase CLI. Details: [04 — Supabase setup](./04-supabase-setup.md).

## Create owner / staff

1. Supabase Dashboard → Authentication → add user (email + password).
2. SQL editor:

```sql
insert into public.profiles (id, email, role, is_active)
values ('<auth-user-uuid>', 'owner@example.com', 'owner', true)
on conflict (id) do update set role = 'owner', is_active = true;
```

Roles: `owner` · `manager` · `staff`. Middleware blocks ERP unless profile role is staff-capable.

## Media (Supabase Storage first)

1. Apply `supabase/migrations/20260725000001_media_assets.sql`.
2. Ensure a **public** Storage bucket named `media` exists (SQL in that migration era / dashboard).
3. Optional: set `AI_IMAGE_API_KEY` for AI cover generation in `/erp/media`.
4. Optional: Cloudinary keys to **migrate** hot images from Supabase → CDN (ERP action).

See [10 — Media pipeline](./10-media-pipeline.md).

## Cloudinary setup

1. Create a Cloudinary cloud; note cloud name, API key, secret.
2. Set env vars in `.env.local` (and Vercel).
3. Staff upload flow: `POST /api/cloudinary/sign` → browser uploads to `dsb/covers` folder.
4. `BookCover` uses `next-cloudinary` when `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set; otherwise `buildCoverUrl()` fallback.

Unsigned upload preset is optional; signed uploads use the API route.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Migration reminder |

## Folder structure

```
src/
  app/
    (storefront)/     # Public site: /, /books, /authors, /enquiry, …
    (erp)/erp/        # Staff ERP under /erp
    api/cloudinary/   # Signed upload
  components/
    erp/              # ERP UI (forms, sidebar, POS)
    media/            # BookCover, CoverUpload
    ui/               # shadcn components
  lib/
    erp/              # Server actions, auth, formatters
    supabase/         # Clients + middleware session helper
    cloudinary.ts     # Config + buildCoverUrl
  types/erp.ts        # Shared types
supabase/migrations/  # SQL schema
docs/                 # Product & dev documentation
```

## Vercel deploy

1. Push to GitHub; import project on Vercel.
2. Set the same env vars as `.env.local`.
3. Run migration on production Supabase (same SQL file).
4. Create owner profile on production Auth user.
5. Deploy; verify `/` and `/erp/login`.

Use a Supabase region close to users (e.g. Singapore) for latency.

## Coding conventions

- **UI:** shadcn/ui + Tailwind; match existing blue / yellow / green theme.
- **Data:** Supabase only — no fixture mocks in app code.
- **Auth:** `requireStaff` / `requireManager` / `requireOwner` in ERP pages; middleware enforces staff role on `/erp/*`.
- **Server actions:** `src/lib/erp/actions.ts`; revalidate affected paths after mutations.
- **Images:** Cloudinary `public_id` on `books.cover_public_id`; use `CoverUpload` in forms.
- **Types:** Extend `src/types/erp.ts` when schema changes.

## Related docs

- [ERP module map](./06-erp-module-map.md)
- [Implemented vs planned](./07-implemented-vs-planned.md)
- [Supabase setup](./04-supabase-setup.md)
