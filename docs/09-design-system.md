# Design System — DSB Production

## Brand direction
**Himalayan literary luxury** — calm, premium, book-led. Not purple SaaS, not cream-terracotta, not newspaper.

## Color tokens (shadcn CSS variables)

| Token | Role | Direction |
| --- | --- | --- |
| `--primary` | Sapphire blue | Brand, links, primary buttons |
| `--accent` | Antique gold | Highlights, secondary CTAs, PWA install |
| `--secondary` | Forest green | In-stock, success, Bhutan cue |
| `--background` | Soft mist / parchment gradient | Atmosphere |
| `--foreground` | Ink charcoal | Body text |
| `--sidebar` | Deep sapphire | ERP chrome |

All colors live in `src/app/globals.css` via shadcn variables only.

## Typography
- **Display / headings:** Libre Bodoni (or equivalent expressive serif via `next/font`) — brand-first  
- **UI / body:** Geist Sans  
- Avoid Inter / Roboto / Arial as brand voice  

## Storefront composition rules
1. First viewport = one composition: brand + one headline + one line + CTA + full-bleed visual  
2. No cards in hero; cards only when interactive (book tiles)  
3. No hero overlays (badges/stickers)  
4. One job per section  
5. Motion: 2–3 intentional animations via **Motion** (`motion/react`) — hero fade, shelf stagger, PWA banner slide. No HeroUI. Aceternity only as inspiration. GSAP not required for v1.  

## Mobile template (public)
- Sticky top brand bar (compact)  
- **Bottom navigation:** Home · Catalogue · Authors · Enquire · Staff  
- Touch targets ≥ 44px  
- Book grid: 2-col phone, 3-col tablet, 4-col desktop  
- Sticky “Enquire / Add” CTA on book detail  
- Safe-area padding for notched phones  

## ERP mobile template
See **[13 — ERP mobile shell](./13-erp-mobile-shell.md)** for the full spec.

- **`< md`:** no persistent sidebar — top bar + **bottom tabs** (Home · POS · Orders · Books · More) + left **Sheet drawer** for full menu  
- **`≥ md`:** grouped sapphire sidebar (Sell / Catalogue / Ops / Insights / Admin)  
- Touch targets ≥ 44px; `pb-safe` on bottom bar  
- Tables → stacked cards on small screens (page-level follow-up)  
- Dense but calm; sapphire chrome on desktop sidebar only  

## Density & feedback
- Loading: skeletons (shadcn)  
- Success/errors: Sonner toasts  
- Empty states: one sentence + primary action  
