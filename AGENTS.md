<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Two things run for full local dev:

| Service | How to run | Notes |
| --- | --- | --- |
| Next.js app (storefront `/` + ERP `/erp`) | `npm run dev` → http://localhost:3000 | Reads `.env.local`. Turbopack. |
| Local Supabase (DB + Auth + Storage) | `npx supabase start` | Requires Docker. Provides everything the app needs — no remote secrets. |

The app has **no mock data**: every page reads from Supabase, so Supabase must be up or pages error/empty. There is no test runner (no `test` script). Standard commands live in `package.json` and `docs/05-developer-guide.md`.

### Supabase is local (not the remote project)

`.env.local` points at the local stack from `npx supabase start` (fixed demo anon/service keys — deterministic, not secret). Do not use the `ksbkbedekzsgqxrvcjus.supabase.co` project referenced in `docs/`; we run everything locally.

Non-obvious gotchas discovered during setup:

- **Docker is required and is not auto-started.** If `docker ps` fails: start the daemon (`sudo dockerd &`, or via tmux) and `sudo chmod 666 /var/run/docker.sock`. Docker 29 needs `/etc/docker/daemon.json` with `storage-driver: fuse-overlayfs` and `features.containerd-snapshotter: false`, plus `iptables-legacy`.
- **`supabase/config.toml` sets `auto_expose_new_tables = true`.** The current Supabase default does NOT grant Data API access to tables created by migrations, which makes PostgREST return `permission denied` for every table and breaks the whole app. Keep this enabled locally.
- After a fresh `npx supabase start` or `npx supabase db reset`, the DB has schema but no data/users. Run, in order:
  1. `node --env-file=.env.local scripts/dev-bootstrap.mjs` — creates the public `media` bucket, the owner auth user, and its owner `profiles` row.
  2. `docker exec -i supabase_db_ksbkbedekzsgqxrvcjus psql -U postgres -d postgres < scripts/dev-storage-policies.sql` — storage RLS so the seed can upload covers (the ERP media UI itself uses the service-role client and does not need this).
  3. `node --env-file=.env.local scripts/seed-live-catalogue.mjs` — 10 published books + authors/categories/collections with generated covers.
- **ERP login (owner) for testing:** `dsb.owner@gmail.com` / `DsbOwner2026!` (also `SEED_OWNER_*` in `.env.local`). ERP routes require a `profiles.role` of owner/manager/staff; middleware redirects others to `/erp/login`.
- Media uploads from the ERP UI use the service-role admin client (`src/lib/supabase/admin.ts`), so they bypass storage RLS and only need `SUPABASE_SERVICE_ROLE_KEY` set.
- Pre-existing lint error in `src/hooks/use-mobile.ts` (`react-hooks/set-state-in-effect`) and a Next.js `middleware`→`proxy` deprecation warning; both are unrelated to env setup.
