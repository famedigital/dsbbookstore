# DSB Book Store

Luxury digital catalogue + **full production ERP** for DSB Books (Thimphu, Bhutan).

## Surfaces

| Surface | Purpose |
| --- | --- |
| `/` public (PWA) | Mobile-first catalogue, authors, enquiries, installable app |
| `/erp` | Full staff/owner ERP — POS, inventory, purchasing, media library |

## Production upgrade (in progress)

See **[docs/08-production-upgrade-plan.md](./docs/08-production-upgrade-plan.md)** for the master roadmap:

- Full ERP production mode  
- Mobile template + **PWA install notification**  
- **AI images → Supabase Storage first**, migrate to Cloudinary from ERP  
- Design system (premium Blue / Gold / Green)

## Stack
Next.js · shadcn/ui · Supabase (DB + Storage) · Cloudinary (optional CDN) · Vercel · PWA  
**No mock data.**

## Getting started

```bash
npm install
cp .env.example .env.local
# Apply supabase/migrations/*.sql in Supabase SQL editor
npm run dev
```

- Storefront: http://localhost:3000  
- ERP: http://localhost:3000/erp/login  

## Docs
Start here: [docs/README.md](./docs/README.md)  
Status: [docs/07-implemented-vs-planned.md](./docs/07-implemented-vs-planned.md)
