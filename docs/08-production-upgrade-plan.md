# DSB Production Upgrade Plan

**Goal:** Take the current catalogue + ERP from “working MVP” to **full production mode** — luxury mobile-first storefront, complete staff/owner ERP, PWA install, and a clean media pipeline (AI images → Supabase Storage → optional Cloudinary migrate).

**Rule:** Documentation first, then code. Every feature lands with schema + UI + docs so work stays smooth from commit one.

---

## 1. Current baseline → production target

| Layer | Today | Production target |
| --- | --- | --- |
| Storefront | Functional catalogue | Ultra-luxury, mobile-first, PWA |
| ERP | Module shells + core actions | Full production ops (POS sessions, receipts, multi-line PO, media library, migrate) |
| Images | Cloudinary public_id text / optional upload | **AI images stored in Supabase Storage first**; ERP Media Library; one-click migrate to Cloudinary + delete Supabase originals |
| Mobile | Responsive pages | Dedicated mobile template (bottom nav, touch targets, install prompt) |
| Deploy | Domain/SSO issues | Documented Vercel production checklist |

---

## 2. Workstreams (order of execution)

### W0 — Docs (this pack) ✅
- Design system  
- Media pipeline  
- PWA + mobile  
- ERP production feature list  
- Migration / rollout notes  

### W1 — Design system + mobile shell
- Premium Blue / Gold / Green tokens (refined)  
- Storefront mobile layout + bottom nav ✅  
- ERP mobile-friendly shell → see [13-erp-mobile-shell.md](./13-erp-mobile-shell.md)  
- Typography + motion baseline ✅

### W2 — Media pipeline (Supabase-first)
- Supabase Storage bucket `media`  
- `media_assets` table (source, path, cloudinary_id, status)  
- AI image generation → save to Supabase  
- ERP Media Library UI  
- Migrate to Cloudinary + delete Supabase file  

### W3 — PWA
- `manifest.webmanifest`  
- Service worker (static + offline shell)  
- Install prompt banner (Android/desktop; iOS instructions)  

### W4 — ERP full production
See [12-erp-production-mode.md](./12-erp-production-mode.md)

### W5 — Storefront production polish
- Collections public pages  
- Luxury home/book UX  
- Sitemap + Schema.org  

### W6 — Hardening
- Vercel env checklist  
- Seed / content import  
- Role QA  
- Performance + Lighthouse mobile  

---

## 3. Non-negotiables

1. **No mock data** — every screen hits Supabase.  
2. **shadcn/ui only** for primitives + tokens.  
3. **Images start in Supabase Storage** (AI-generated or uploaded). Cloudinary is an **optimization CDN destination**, not the only source.  
4. **Mobile-first** public site; ERP usable on phone/tablet.  
5. **Docs updated** when features ship (`07-implemented-vs-planned.md`).  

---

## 4. Environment variables (production)

```bash
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # invites, AI gen server, admin storage

# Site
NEXT_PUBLIC_SITE_URL=

# Cloudinary (optional until migrate)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AI image generation (server-only)
AI_IMAGE_PROVIDER=openai            # or fal / replicate — configurable
AI_IMAGE_API_KEY=
```

---

## 5. Definition of “FULL PRODUCTION MODE”

Staff can run the store day-to-day without spreadsheets:

- Open POS session → sell → print/share receipt → close cash-up  
- Receive multi-line POs (partial OK)  
- Manage catalogue + media library  
- Generate AI covers into Supabase; migrate hot titles to Cloudinary  
- Handle enquiries → convert to customer/order  
- Owner sees sales, margin, low stock, staff  

Public visitors get:

- Luxury mobile catalogue + PWA install  
- Fast images (Supabase URL or Cloudinary after migrate)  
- Enquiry / later checkout  

---

## 6. Related docs

| Doc | Topic |
| --- | --- |
| [09 — Design system](./09-design-system.md) | Colors, type, mobile UX |
| [10 — Media pipeline](./10-media-pipeline.md) | AI → Supabase → Cloudinary |
| [11 — PWA & mobile](./11-pwa-mobile.md) | Install prompt, templates |
| [12 — ERP production mode](./12-erp-production-mode.md) | Complete ERP features |
| [07 — Status matrix](./07-implemented-vs-planned.md) | Live checklist |
