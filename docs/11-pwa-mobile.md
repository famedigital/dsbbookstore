# PWA & Mobile Template

## Goals
1. Installable on phone home screen  
2. Clear **install notification / banner** (not spammy)  
3. Offline shell for home + catalogue shell (network-first for live stock)  
4. Dedicated mobile UX patterns (bottom nav, safe areas)

## Files
```text
public/manifest.webmanifest
public/icons/icon-192.png
public/icons/icon-512.png
public/sw.js                    # or next-pwa / Serwist
src/components/pwa/install-prompt.tsx
src/components/storefront/mobile-nav.tsx
src/app/layout.tsx              # manifest + theme-color + apple-mobile-web-app
```

## Manifest (essentials)
- `name`: DSB Books  
- `short_name`: DSB  
- `start_url`: `/`  
- `display`: `standalone`  
- `background_color` / `theme_color`: sapphire  
- Icons 192 + 512  

## Install notification UX
- Show banner after ~10s or 2nd page view  
- Copy: “Install DSB Books for quick shelf checks”  
- Primary: **Install** (triggers `beforeinstallprompt`)  
- Dismiss: remember 14 days in `localStorage`  
- iOS Safari: show “Share → Add to Home Screen” instructions sheet (no beforeinstallprompt)  

## Service worker strategy
| Resource | Strategy |
| --- | --- |
| App shell (layout, CSS) | Cache-first |
| `/books` HTML | Network-first, fallback cache |
| Book API/data | Network-only (stock must be fresh) |
| Images | Stale-while-revalidate |

## Mobile template map
### Public bottom nav
Home · Catalogue · Authors · Enquire · More  

### Book detail mobile
- Full-width cover  
- Price + availability sticky footer  
- Enquire button  

### ERP mobile
- Drawer nav  
- POS: full-screen cart sheet  

## Testing checklist
- [ ] Lighthouse PWA ≥ installable  
- [ ] Android Chrome install banner  
- [ ] iOS instruction path  
- [ ] Offline: shows shell, not blank white  
- [ ] Safe-area on iPhone notch  
