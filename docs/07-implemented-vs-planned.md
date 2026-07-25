# Implemented vs planned

Updated for **Production Upgrade** ([08](./08-production-upgrade-plan.md)).

| Feature | Phase | Status | Notes |
| --- | --- | --- | --- |
| **Storefront** | | | |
| Home + catalogue + enquiry | Soft | Done | Live Supabase |
| Authors pages | Soft | Done | |
| Filters / sort | Soft | Done | |
| Privacy / terms | Soft | Done | |
| Mobile bottom nav template | Prod | Done | Storefront bottom nav |
| PWA + install notification | Prod | Done | manifest + SW + banner |
| Luxury design / motion pass | Prod | Partial | Tokens + mobile shell |
| Public collections | Soft | Planned | |
| Schema.org / sitemap | Soft | Partial | Sitemap done; Schema.org still planned |
| **Media** | | | |
| AI images → Supabase Storage | Prod | Done | Needs `AI_IMAGE_API_KEY` |
| ERP Media Library | Prod | Done | `/erp/media` |
| Migrate Supabase → Cloudinary + delete | Prod | Done | Manager+ action |
| Legacy Cloudinary public_id | MVP | Done | Kept for compat |
| **ERP** | | | |
| Catalogue / authors / categories | Soft | Done | |
| Inventory ledger | Soft | Done | |
| POS sell | Soft | Done | |
| POS sessions + receipt | Prod | Done | Open/close session + receipt print view |
| Orders detail + COD complete | Soft | Done | |
| Multi-line PO + partial receive | Prod | Done | Multi-line PO editor + partial receive on PO detail |
| Customers history | Prod | Done | `/erp/customers/[id]` edit + order history |
| Enquiries convert + email | Prod | Partial | Convert/assign in UI; Resend email notify still planned |
| Finance + cash-up | Prod | Partial | |
| Publishing + print/royalty UI | Prod | Partial | Pipeline done; print/royalty UI planned |
| Staff invite + audit viewer | Prod | Done | Invite + `/erp/audit` for managers/owners |
| Reports CSV / margin | Prod | Done | 30-day metrics, margin column, CSV export |
| **Infra** | | | |
| Supabase schema + RLS | Soft | Done | |
| No mock data | Soft | Done | |
| Vercel public domain | Soft | Planned | |
| **Commerce Phase 2** | | | |
| Cart / checkout / payments | Later | Planned | |

**Legend:** Done · In progress · Partial · Planned · Blocked
