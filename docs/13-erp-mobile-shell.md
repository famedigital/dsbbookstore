# ERP Mobile Shell & Navigation

**Status:** Implemented (docs-first)  
**Related:** [09 — Design system](./09-design-system.md) · [11 — PWA & mobile](./11-pwa-mobile.md) · [12 — ERP production mode](./12-erp-production-mode.md) · [06 — Module map](./06-erp-module-map.md)

## Problem

The ERP workspace currently renders a **permanent `w-64` sidebar** on all breakpoints. On phones this consumes most of the viewport, leaving almost no room for POS, tables, or forms. Staff need a **content-first mobile layout** with a different menu pattern than desktop.

## Goals

1. **Mobile (`< md`)**: no persistent sidebar; content uses full width  
2. **Primary work** reachable in one tap: Dashboard · POS · Orders · Catalogue  
3. **Full module list** in a slide-over drawer (“More” / hamburger)  
4. **Desktop (`md+`)**: keep sapphire sidebar, but **grouped** menu + clearer hierarchy  
5. Touch targets ≥ 44px; safe-area padding for notched phones  
6. Role filtering unchanged (`navForRole`)

## Information architecture

### Nav groups (drawer + desktop sidebar)

| Group | Items | Notes |
| --- | --- | --- |
| **Sell** | Dashboard, POS, Orders, Enquiries | Daily floor work |
| **Catalogue** | Catalogue, Media, Authors, Categories | PIM |
| **Ops** | Inventory, Purchasing*, Customers | Stock & CRM |
| **Insights** | Reports, Finance*, Publishing*, Audit* | Manager+ where marked |
| **Admin** | Staff†, Settings† | Owner only (†) |

\* manager+ · † owner only

### Mobile bottom bar (fixed)

Five slots only:

| Slot | Label | Route | Behaviour |
| --- | --- | --- | --- |
| 1 | Home | `/erp` | Dashboard |
| 2 | POS | `/erp/pos` | Primary sell action (visually emphasized) |
| 3 | Orders | `/erp/orders` | |
| 4 | Books | `/erp/catalogue` | |
| 5 | More | — | Opens full nav drawer |

Active state: sapphire accent + gold underline or filled icon.  
Bottom bar sits above `env(safe-area-inset-bottom)` with `pb-safe`.

### Mobile top bar

```
[ ☰ Menu ]   DSB ERP · {page title}          [{role}]
```

- Hamburger also opens the same drawer as **More**  
- Compact height (~52–56px); no second heavy header block  
- Optional: hide the old “Staff & Owner Workspace” subtitle on mobile

### Desktop sidebar

- Width ~240px, sapphire (`bg-sidebar`) preserved  
- Brand block: **DSB Books / ERP** + name + role  
- Group labels (muted uppercase tracking)  
- Links: icon + label; active = accent fill  
- Sign out at bottom  
- **No bottom bar** on `md+`

## Layout structure

```text
src/components/erp/
  nav.ts                 # items + groups + bottomNav helpers
  erp-shell.tsx          # responsive shell (client)
  sidebar.tsx            # desktop sidebar (or folded into shell)
  mobile-bottom-nav.tsx  # fixed bottom tabs
  mobile-nav-drawer.tsx  # Sheet with grouped links

src/app/(erp)/erp/(workspace)/layout.tsx
  → ErpShell(profile) wraps children
```

### Breakpoint rules

| Viewport | Chrome |
| --- | --- |
| `< md` | Top bar + main (`pb-24`) + bottom nav + drawer |
| `≥ md` | Sidebar + slim top context bar + main |

## Button & control language (ERP)

Distinct from storefront luxury CTAs:

| Control | Mobile | Desktop |
| --- | --- | --- |
| Primary action | Full-width or large (`h-11`) sapphire | Standard `Button` |
| Secondary | Outline, min height 44px | Default |
| Destructive | Outline destructive | Same |
| POS charge | Emphasized gold/amber accent on dark/sapphire context | Same |
| Icon nav | 24px icons, label under (bottom bar) | 16px icons inline |

Avoid pill clusters and multi-shadow cards. Tables may stack as simple bordered rows on small screens in a later pass; this doc’s scope is **shell + menu**.

## Drawer UX

- Component: shadcn `Sheet` (left)  
- Close on: route change, overlay tap, X, Escape  
- Contents: profile strip → grouped nav → Sign out  
- Scrollable body if many modules  

## Acceptance criteria

- [x] On a 390×844 viewport, opening `/erp` shows **full-width** main content (sidebar not always visible)  
- [x] Bottom bar visible; POS is the emphasized center/primary slot  
- [x] **More** / hamburger opens drawer with all role-allowed modules  
- [x] Navigating a drawer link closes the drawer and loads the page  
- [x] Desktop (`≥768px`) shows grouped sidebar; **no** bottom bar  
- [x] Staff / manager / owner still see correct filtered items  
- [x] Safe-area: bottom nav not clipped on notched iPhones  
- [x] Docs `07` / `09` / `11` / `README` updated when shipped  

## Out of scope (this pass)

- Rewriting every ERP page table → card  
- POS full-screen charge sheet (follow-up; shell must not block it)  
- Offline ERP caching  

## Implementation order

1. Document (this file) + index updates  
2. Extend `nav.ts` with groups + `erpBottomNav`  
3. Build drawer + bottom nav + `ErpShell`  
4. Wire workspace layout; remove always-on mobile sidebar  
5. Smoke-test roles + build  
6. Mark Done in `07-implemented-vs-planned.md`  
