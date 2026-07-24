# Implemented vs planned

Status matrix from [02 — Product & tech plan](./02-complete-product-tech-plan.md). Updated for current codebase.

| Feature | Planned | Status | Notes |
| --- | --- | --- | --- |
| **Storefront** | | | |
| Home + featured books | M1 | Done | Live Supabase |
| Books list + search | M1 | Done | `q` param |
| Filters (format, availability) | M1 | Done | Query params |
| Sort (newest, title, price) | M1 | Done | |
| Book detail + enquiry | M1 | Done | Redirect `?sent=1` |
| Authors index + detail | M1 | Done | `book_authors` join |
| Visit page | M1 | Done | |
| Privacy / terms | M1 | Done | Static pages |
| SEO metadata per book | M1 | Done | `generateMetadata` |
| Schema.org / sitemap | M1 | Partial | Not yet |
| Categories / collections public | M1 | Planned | ERP CRUD only |
| Luxury motion / design pass | M1 | Partial | Base theme in place |
| **ERP** | | | |
| Auth + role guard | M2 | Done | Middleware + `requireStaff` |
| Catalogue CRUD | M2 | Done | New/edit/list |
| Authors / categories CRUD | M2 | Done | ERP pages |
| Inventory ledger | M2 | Done | `stock_movements` |
| POS | M2 | Done | |
| Orders | M2 | Done | |
| Purchasing + GRN | M2 | Done | Manager+ |
| Customers | M2 | Done | |
| Enquiries inbox | M2 | Done | |
| Finance / expenses | M2 | Done | Manager+ |
| Publishing pipeline | M2 | Done | Manager+ |
| Reports | M2 | Done | Basic |
| Staff management | M2 | Done | Owner |
| Store settings | M2 | Done | Owner |
| Cover upload (Cloudinary) | M2 | Done | Signed upload |
| **Infra** | | | |
| Supabase schema + RLS | M0 | Done | Single migration |
| Cloudinary integration | M0 | Done | Sign route + upload |
| Vercel deploy | M0 | Ready | Env-driven |
| No mock data | M0 | Done | |
| **Phase 2 (commerce)** | | | |
| Cart / checkout | M4 | Planned | |
| Online payments | M4 | Planned | |
| Customer accounts | M5 | Planned | |
| Email notifications | M4 | Planned | |
| CSV import | M5 | Planned | |
| Analytics | M3 | Planned | |

**Legend:** Done = shipped in repo · Partial = started · Planned = not built · Ready = documented, deploy-only
