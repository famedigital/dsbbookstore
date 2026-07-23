# DSB Book Store — Complete Product & Technical Plan

**Client:** DSB Book Store / DSB Publication — Thimphu, Bhutan  
**Location:** Jojo’s Shopping Complex, Chang Lam  
**Product type:** Luxury digital catalogue → enquire/reserve → online sales  
**Status:** Planning document (implementation-ready)

---

## 0. Executive summary

Build a **super-modern, ultra-luxury public website** that functions as DSB’s official digital catalogue: visitors search, browse, and check live availability; admins manage books, authors, pricing, inventory, and customer enquiries.

**Non-negotiable engineering rules (from you):**

1. **shadcn/ui only** for UI primitives, colors, and design tokens — install components from shadcn; no parallel component libraries.
2. **Primary palette:** premium Blue + Yellow + Green (CSS variables via shadcn theme).
3. **Stack:** Next.js on **Vercel**, data/auth on **Supabase**, images on **Cloudinary**.
4. **From commit one of the app:** real Supabase connection — **no mock data**.
5. **Cloudinary** delivers bandwidth-adaptive images for any network speed.
6. Public site must feel **ultra luxury**; admin must feel **efficient**.

**Business recommendation:** Ship in three phases so the client gets a live catalogue quickly, then sell online once Bhutan payment + delivery are locked.

| Phase | Name | Outcome |
| --- | --- | --- |
| **1** | Living Catalogue | Browse, search, availability, enquiries, full admin |
| **2** | Commerce | Cart, checkout, COD/QR/card, pickup & delivery |
| **3** | Growth | Wishlists accounts, events, analytics depth, content |

---

## 1. Product vision

### 1.1 One-sentence vision
A premium digital home for DSB publications and the Thimphu store shelf — beautiful enough for international visitors, practical enough for daily staff inventory and enquiries.

### 1.2 Primary users

| User | Goals | Success looks like |
| --- | --- | --- |
| **Browser / tourist** | Discover Bhutanese titles, check if in stock | Finds book in <30s, sees clear availability |
| **Local customer** | Check stock before visiting / request hold | Enquires or reserves; picks up at store |
| **Diaspora / remote buyer** | Buy DSB books from abroad | Phase 2: pays + ships; Phase 1: enquiry |
| **Admin / staff** | Add books, update stock/price, answer enquiries | Completes ops without developer help |
| **Owner** | Brand presence + sales pipeline | Live site, measurable enquiries/orders |

### 1.3 Brand & UX principles (public site)

Aligned with luxury literary storefronts (Faber, Babylon Library, high-end publisher sites):

- **Brand first:** “DSB” / “DSB Books” is a hero-level signal on the first viewport — not a tiny nav logo.
- **One composition:** first screen = brand + one headline + one supporting line + CTA + dominant full-bleed visual (bookstore / books / Thimphu atmosphere). No stats strips, no card grids in the hero.
- **No default AI look:** avoid purple gradients, cream+terracotta, broadsheet density. Direction: **Himalayan literary luxury** — deep sapphire blue, soft gold yellow, forest green; expressive typography (via next/font, not Inter/Roboto).
- **Covers are the product:** large, sharp Cloudinary-optimized covers; whitespace; calm motion (2–3 intentional animations).
- **Cards only when interactive** (e.g. book tiles that navigate); never decorative card chrome in the hero.
- **shadcn everywhere:** Button, Input, Dialog, Sheet, Form, Table, Badge, Select, Tabs, Sonner, etc. — theme tokens drive Blue/Yellow/Green.

### 1.4 Working brand tokens (premium, not neon)

Install and customize via shadcn theme (`components.json` + CSS variables):

| Token role | Direction | Notes |
| --- | --- | --- |
| `--primary` | Deep sapphire / royal blue | Trust, bookshelf night, premium |
| `--accent` | Soft gold / antique yellow | Highlights, prices, CTAs secondary |
| `--secondary` or chart/success | Forest / jade green | In-stock, Bhutanese nature cue |
| Background | Warm off-white → soft blue mist gradient / subtle paper texture | Atmosphere without flat fill |
| Foreground | Near-ink charcoal | High readability |

Exact hex values finalized in design pass; all must live in shadcn CSS variables only.

---

## 2. Feature plan (what the business needs)

### 2.1 Must-have — Phase 1 (Living Catalogue)

These match the client brief **and** international catalogue baselines.

#### Public website
1. **Home** — brand hero, featured collections, new arrivals, staff/store CTA  
2. **Catalogue browse** — grid/list, pagination, sort (newest, title, price)  
3. **Search** — title, author, ISBN, keyword (Supabase full-text / `ilike` + indexes)  
4. **Filters** — category/genre, language, format, availability, price range, publisher (DSB vs others if sold)  
5. **Book detail page** — cover, title, subtitle, authors, blurb, ISBN, pages, language, format, dimensions, price (BTN), stock status, related titles, enquire CTA  
6. **Author pages** — bio + all titles  
7. **Collections / shelves** — curated lists (e.g. Folklore, Buddhism, Children’s, New Releases)  
8. **Availability states** — In stock / Low stock / Out of stock / Coming soon / Enquire only  
9. **Enquiry form** — per book or general; stores in Supabase; email notify admin  
10. **Store info** — address, hours, map, phone, about DSB  
11. **Legal** — privacy, terms  
12. **SEO** — SSR/SSG book pages, Open Graph covers, Schema.org Book/Product  
13. **Responsive** — mobile-first; fast on slow networks via Cloudinary  

#### Admin (`/admin`)
1. Auth (Supabase Auth — email magic link or password; role = admin)  
2. Dashboard — counts: books, low stock, open enquiries  
3. Books CRUD — all fields, cover upload → Cloudinary, publish/unpublish  
4. Authors CRUD  
5. Categories / collections CRUD  
6. Pricing & inventory adjust (inline stock update)  
7. Enquiries inbox — status: new / in progress / closed; reply notes  
8. Media manager — Cloudinary URLs attached to books  
9. Soft delete / archive  

**Hard rule:** every screen reads/writes Supabase. Empty states are empty DB states, not fake arrays.

---

### 2.2 Should-have — Phase 2 (Commerce)

Client will likely want to sell online. Plan for it in schema from day one (cart-ready fields), implement checkout after Phase 1 is live.

1. **Cart + checkout**  
2. **Order management** in admin (status pipeline)  
3. **Payment options for Bhutan**
   - Cash on Delivery / Pay at store (highest trust locally)
   - Bank QR / Bhutan Payment System / local bank e-pay (confirm with DSB’s bank)
   - International card gateway for tourists/diaspora (evaluate Stripe + local PSP; do not assume Stripe alone works for BTN)
4. **Fulfillment modes**
   - Collect at DSB (Chang Lam)
   - Thimphu delivery
   - Nationwide (Bhutan Post / Dozo-class partners — confirm with client)
   - International shipping (quote / manual for early stage)
5. **Order emails** (customer + admin)  
6. **Stock decrement** on paid/confirmed orders  
7. **Wishlist** (auth optional or localStorage → account later)  

---

### 2.3 Nice-to-have — Phase 3 (Growth)

1. Customer accounts + order history  
2. Events / book launches calendar  
3. Staff picks & editorial essays  
4. “Notify me when back in stock”  
5. Basic analytics dashboard (views, top enquiries, conversion)  
6. Bulk CSV import for books  
7. Multi-language UI (English + Dzongkha labels where useful)  
8. Gift notes / school bulk enquiry workflow  

---

### 2.4 Explicitly out of scope (for now)

- Full POS hardware sync  
- Ebook reader / audiobook streaming  
- Marketplace for third-party sellers  
- Native mobile apps (responsive web first)  

---

## 3. Information architecture

### 3.1 Public routes

```
/                     Home
/books                Catalogue
/books/[slug]         Book detail
/authors              Author index
/authors/[slug]       Author detail
/collections/[slug]   Curated shelf
/about                About DSB
/visit                Store location & hours
/enquiry              General enquiry
/cart                 (Phase 2)
/checkout             (Phase 2)
/account/*            (Phase 3)
/privacy
/terms
```

### 3.2 Admin routes

```
/admin                Dashboard
/admin/books
/admin/books/new
/admin/books/[id]
/admin/authors
/admin/categories
/collections          (admin CRUD)
/admin/inventory
/admin/enquiries
/admin/orders         (Phase 2)
/admin/settings
```

---

## 4. Technical architecture

```
┌─────────────────────────────────────────────────────────┐
│  Public Storefront (Next.js App Router)                 │
│  shadcn/ui · Tailwind · next/font · Framer Motion       │
└─────────────┬───────────────────────────┬───────────────┘
              │ RSC / Server Actions       │
              ▼                            ▼
┌──────────────────────────┐   ┌──────────────────────────┐
│  Supabase                │   │  Cloudinary              │
│  Postgres · Auth · RLS   │   │  Covers · transforms     │
│  Storage (optional docs) │   │  q_auto, f_auto, dpr     │
└──────────────────────────┘   └──────────────────────────┘
              ▲
              │ service role (server only)
┌─────────────┴──────────────┐
│  Admin (same Next.js app)  │
│  Protected by Supabase Auth│
└────────────────────────────┘
              │
              ▼
┌────────────────────────────┐
│  Vercel                    │
│  Edge deploy · env vars    │
│  Preview deploys per PR    │
└────────────────────────────┘
```

### 4.1 Recommended stack versions / libs

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Next.js (App Router) + TypeScript | Same path Bookshop.org / Adlibris moved to; SSR SEO |
| UI | **shadcn/ui** + Tailwind | Your requirement; accessible primitives |
| Animation | Motion (Framer) — sparse | Luxury presence, not noise |
| Backend | Supabase (Postgres + Auth + RLS) | Real data from day 1 |
| Images | Cloudinary + `next/image` loader | Adaptive bandwidth |
| Validation | Zod | Forms + server actions |
| Forms | React Hook Form + shadcn Form | Admin + enquiry |
| Email | Resend or Supabase Edge Function + SMTP | Enquiry alerts |
| Hosting | Vercel | Preview + production |
| Payments (P2) | TBD with bank + PSP | Bhutan-specific |

### 4.2 Supabase from day one (no mocks)

**Bootstrap order before UI polish:**

1. Create Supabase project  
2. Commit SQL migrations in repo (`supabase/migrations/…`)  
3. Wire `@supabase/ssr` clients (browser + server)  
4. Seed **real** initial rows via SQL seed (can be DSB sample titles) — still DB data, not in-code mocks  
5. Public pages `select` from Supabase; admin `insert/update/delete` with RLS  

If credentials missing in a local env, the app should fail clearly — not fall back to fake books.

### 4.3 Cloudinary image strategy

All book covers and hero media go through Cloudinary:

| Concern | Implementation |
| --- | --- |
| Upload | Admin signed upload (unsigned preset restricted, or server-signed) |
| Delivery | `f_auto,q_auto` — format + quality by device/browser |
| Responsive | `w_` / `c_fill` / `dpr_auto` for catalogue tiles vs detail hero |
| Slow networks | Prefer moderate quality defaults; lazy-load below fold |
| Next.js | Custom `cloudinaryLoader` for `next/image` |
| SEO/social | Dedicated OG transform (1200×630) per book |

Store in DB: `cover_public_id` + optional `cover_url` (derived). Never rely on huge uncompressed uploads on the public site.

### 4.4 shadcn installation policy

- Initialize shadcn once; add components with CLI as needed  
- Theme colors only via CSS variables in `globals.css`  
- Prefer official shadcn blocks/patterns for admin tables, forms, sheets  
- Do **not** introduce MUI / Chakra / custom random button systems  

---

## 5. Data model (Supabase / Postgres)

Design Phase-1 tables to already support Phase-2 orders.

### 5.1 Core tables

```text
profiles
  id uuid PK → auth.users
  full_name text
  role text  -- 'admin' | 'staff' | 'customer'
  created_at timestamptz

authors
  id uuid PK
  name text not null
  slug text unique not null
  bio text
  photo_public_id text
  created_at / updated_at

categories
  id uuid PK
  name text not null
  slug text unique not null
  description text
  sort_order int

collections
  id uuid PK
  title text not null
  slug text unique not null
  description text
  hero_public_id text
  is_featured boolean
  sort_order int

books
  id uuid PK
  title text not null
  subtitle text
  slug text unique not null
  description text
  isbn_13 text unique
  isbn_10 text
  language text
  format text          -- paperback | hardcover | etc
  page_count int
  dimensions text
  weight_grams int
  published_at date
  publisher_name text  -- 'DSB Publication' default
  price_btn numeric(12,2) not null default 0
  compare_at_price_btn numeric(12,2)
  stock_qty int not null default 0
  low_stock_threshold int default 3
  availability_status text  -- computed or stored enum
  cover_public_id text
  is_featured boolean default false
  is_published boolean default false
  seo_title text
  seo_description text
  created_at / updated_at

book_authors
  book_id uuid FK
  author_id uuid FK
  sort_order int
  PK (book_id, author_id)

book_categories
  book_id uuid FK
  category_id uuid FK

collection_books
  collection_id uuid FK
  book_id uuid FK
  sort_order int

enquiries
  id uuid PK
  book_id uuid null FK
  name text not null
  email text not null
  phone text
  message text not null
  status text  -- new | in_progress | closed
  admin_notes text
  created_at / updated_at

-- Phase 2
orders
  id uuid PK
  order_number text unique
  customer_name / email / phone
  fulfillment_type  -- pickup | delivery
  payment_method / payment_status
  status  -- pending | confirmed | fulfilled | cancelled
  shipping_address jsonb
  subtotal / shipping_fee / total
  created_at

order_items
  id uuid PK
  order_id FK
  book_id FK
  quantity int
  unit_price numeric
```

### 5.2 Availability rules

```text
if !is_published → hidden from public
if stock_qty <= 0 → Out of stock (enquiry still allowed)
if stock_qty > 0 && stock_qty <= low_stock_threshold → Low stock
else → In stock
optional flag → Coming soon / Preorder (Phase 2)
```

### 5.3 RLS sketch

| Table | Public | Authenticated admin |
| --- | --- | --- |
| books (published) | SELECT | ALL |
| authors, categories, collections | SELECT | ALL |
| enquiries | INSERT | SELECT/UPDATE |
| orders | INSERT (or via service role) | ALL |
| profiles | own row | admin ALL |

Admin checks: `profiles.role in ('admin','staff')`.

---

## 6. Key user flows

### 6.1 Find & check availability
Home → Search/Browse → Filters → Book page → See stock badge → Visit store **or** Enquire

### 6.2 Enquire about a book
Book page → Enquiry sheet/dialog → Submit → Row in `enquiries` → Admin notified → Staff replies offline / updates status

### 6.3 Admin adds a book
Login → Books → New → Fill metadata → Upload cover (Cloudinary) → Set price & stock → Publish → Appears on site immediately

### 6.4 Phase 2 purchase
Book → Add to cart → Checkout → Choose pickup/delivery + payment → Order created → Stock reserved/decremented → Admin fulfills

---

## 7. UI / page composition notes

### 7.1 Home (first viewport)
Only:
1. Brand (DSB Books)  
2. One headline  
3. One short supporting sentence  
4. CTA group (Browse catalogue / Visit store)  
5. One dominant full-bleed image  

Below fold (separate sections, one job each): Featured collection, New arrivals, About strip, Visit.

### 7.2 Catalogue
Clean filters (shadcn Select/Slider/Checkbox), book tiles with cover + title + author + price + stock badge. No noisy badges clusters.

### 7.3 Book detail
Large cover plane, typographic title, metadata list, price, availability, primary CTA (Enquire / Add to cart in P2), description, author block, related.

### 7.4 Admin
Dense but calm: shadcn Sidebar + Table + Sheet forms. Optimize for speed of stock edits.

---

## 8. Implementation roadmap

### Milestone 0 — Foundation
- [ ] Next.js + TypeScript + Tailwind + shadcn init  
- [ ] Theme tokens (blue / yellow / green)  
- [ ] Supabase project + migrations + RLS  
- [ ] Cloudinary account + upload helper  
- [ ] Vercel project + env vars  
- [ ] Supabase clients wired; health query on `/` or `/api/health`  

### Milestone 1 — Catalogue MVP
- [ ] Books list + detail + search + filters  
- [ ] Authors + categories + collections  
- [ ] Enquiry form → Supabase  
- [ ] Cloudinary covers on all book UI  
- [ ] SEO metadata + Schema.org  
- [ ] Luxury public design pass + motion  

### Milestone 2 — Admin MVP
- [ ] Auth + role guard  
- [ ] CRUD books/authors/categories/collections  
- [ ] Inventory & pricing quick edit  
- [ ] Enquiries inbox  
- [ ] Cover upload  

### Milestone 3 — Harden & launch Phase 1
- [ ] Empty/error states, loading skeletons  
- [ ] Accessibility pass  
- [ ] Seed real DSB titles with client  
- [ ] Domain + analytics (Vercel Analytics / GA)  
- [ ] Staff training checklist  

### Milestone 4 — Commerce (Phase 2)
- [ ] Cart, checkout, orders  
- [ ] Payment + fulfillment integration  
- [ ] Stock transactions  
- [ ] Email receipts  

### Milestone 5 — Growth (Phase 3)
- [ ] Accounts, events, notify-me, CSV import, deeper analytics  

---

## 9. Environment variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=

# App
NEXT_PUBLIC_SITE_URL=
ADMIN_EMAILS=                    # optional bootstrap allowlist

# Phase 2
PAYMENT_PROVIDER_KEYS=
EMAIL_API_KEY=
```

Never expose service role or Cloudinary secret to the browser.

---

## 10. Non-functional requirements

| Area | Target |
| --- | --- |
| LCP (mobile) | ≤ 2.5s on mid-tier 4G with Cloudinary |
| Catalogue query | Indexed; p95 < 300ms from Supabase region |
| Uptime | Vercel + Supabase SLA; graceful error UI |
| Security | RLS on; admin routes server-checked |
| Accessibility | Keyboardable shadcn components; alt text on covers |
| SEO | Unique title/description per book; sitemap.xml |
| Bandwidth | Adaptive images; no hero video required |

---

## 11. Content & launch checklist (client)

Before go-live, DSB should provide:

1. Logo (SVG) + brand usage notes  
2. Store photos for hero (or commission)  
3. Initial book list (spreadsheet): title, authors, ISBN, price, stock, blurb, cover files  
4. Categories they use in-store  
5. Opening hours, phone, WhatsApp if any  
6. Enquiry handling owner (who answers)  
7. Decision: Phase 1 enquiry-only vs rush Phase 2 checkout  
8. Preferred payment methods for Phase 2  
9. Delivery policy (Thimphu / national / international)  

---

## 12. Risks & decisions to confirm with client

| Topic | Recommendation | Needs client OK |
| --- | --- | --- |
| Sell online now vs later | Phase 1 catalogue + enquiry; Phase 2 checkout | Yes |
| Currency | BTN primary; show approx USD later if wanted | Yes |
| Scope of catalogue | DSB Publication only vs all store stock | Yes |
| Languages | English UI first | Soft |
| Payment provider | Local bank + COD first | Yes |
| Domain | e.g. dsbbooks.bt / dsb.bt | Yes |

---

## 13. Success metrics

**Phase 1**
- Catalogue indexed in Google for top DSB titles  
- Enquiry volume / week  
- % of book pages with cover + complete metadata  
- Admin time to add a new book < 3 minutes  

**Phase 2**
- Checkout conversion rate  
- Pickup vs delivery mix  
- Stock accuracy (complaints / mismatches)  

---

## 14. Suggested repo structure (when coding starts)

```text
/
  app/
    (public)/...
    admin/...
    api/...
  components/
    ui/                 # shadcn
    books/
    layout/
  lib/
    supabase/
    cloudinary/
    validations/
  supabase/
    migrations/
    seed.sql
  docs/
    01-competitive-research.md
    02-complete-product-tech-plan.md
  public/
```

---

## 15. Immediate next step after plan approval

1. Confirm Phase 1 vs Phase 2 timing with DSB  
2. Create Supabase + Cloudinary + Vercel projects  
3. Scaffold Next.js + shadcn + migrations  
4. Implement health-connected empty catalogue (real DB)  
5. Design tokens + home + book detail  
6. Admin CRUD + enquiry  
7. Seed real DSB titles and launch Phase 1  

---

*This plan is the single source of truth for product scope and architecture until superseded by an approved change.*
