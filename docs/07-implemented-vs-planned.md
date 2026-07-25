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
| Schema.org / sitemap | Soft | Planned | |
| **Media** | | | |
| AI images → Supabase Storage | Prod | Done | Needs `AI_IMAGE_API_KEY` |
| ERP Media Library | Prod | Done | `/erp/media` |
| Migrate Supabase → Cloudinary + delete | Prod | Done | Manager+ action |
| Legacy Cloudinary public_id | MVP | Done | Kept for compat |
| **ERP** | | | |
| Catalogue / authors / categories | Soft | Done | |
| Inventory ledger | Soft | Done | |
| POS sell | Soft | Done | |
| POS sessions + receipt | Prod | Partial | Open/close session done; receipt next |
| Orders detail + COD complete | Soft | Done | |
| Multi-line PO + partial receive | Prod | Planned | |
| Customers history | Prod | Planned | |
| Enquiries convert + email | Prod | Planned | |
| Finance + cash-up | Prod | Partial | |
| Publishing + print/royalty UI | Prod | Partial | |
| Staff invite + audit viewer | Prod | Partial | Invite done |
| Reports CSV / margin | Prod | Partial | Basic reports |
| **Infra** | | | |
| Supabase schema + RLS | Soft | Done | |
| No mock data | Soft | Done | |
| Vercel public domain | Soft | Blocked | Dashboard alias/SSO |
| **Commerce Phase 2** | | | |
| Cart / checkout / payments | Later | Planned | |

**Legend:** Done · In progress · Partial · Planned · Blocked
