import Link from "next/link";
import type { StorefrontThemeId } from "@/lib/storefront/themes";
import {
  PRIMARY_NAV,
  FOOTER_SHOP,
  FOOTER_ABOUT,
} from "@/lib/storefront/institutional";
import { DsbLogo } from "@/components/brand/dsb-logo";

export function StorefrontHeader({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--sf-line)]/70 bg-[color:var(--sf-bg)]/95 backdrop-blur-xl sf-dzong-top">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-0 px-0 md:flex-row md:items-center md:gap-6 md:px-6 md:py-3">
        <div className="flex items-center px-4 py-2.5 md:px-0 md:py-0">
          <DsbLogo variant="lacquer" size={40} />
        </div>

        <nav
          className="flex min-w-0 flex-1 items-center gap-x-5 overflow-x-auto px-4 pb-3 text-[0.875rem] font-medium tracking-wide text-[color:var(--sf-ink)] [scrollbar-width:none] sm:gap-x-6 sm:text-[0.95rem] md:justify-end md:gap-x-5 md:px-0 md:pb-0 md:text-[0.8rem] lg:gap-x-6 [&::-webkit-scrollbar]:hidden"
          aria-label="Primary"
        >
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sf-link-gilt shrink-0 whitespace-nowrap py-1 ${
                active === item.href
                  ? "text-[color:var(--sf-accent)]"
                  : "text-[color:var(--sf-ink)]/80"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="sf-textile mt-auto bg-[color:var(--sf-night,#1a2430)] text-[color:var(--sf-ivory,#f7f2e8)] sf-dzong-top">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:gap-8 sm:py-10 md:grid-cols-4 md:gap-10 md:px-6 md:py-14">
        <div className="md:col-span-1">
          <DsbLogo variant="white" size={52} />
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
            Bhutan&apos;s bookstore on Chang Lam — books, stationery, and a
            bridge for culture and learning.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 md:contents">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-[color:var(--sf-gilt,#9c7a3e)] uppercase">
              Shop
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-white/70">
              {FOOTER_SHOP.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-[color:var(--sf-gilt,#9c7a3e)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-[color:var(--sf-gilt,#9c7a3e)] uppercase">
              DSB
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-white/70 md:grid md:grid-cols-2 md:gap-x-4 lg:grid-cols-3">
              {FOOTER_ABOUT.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-[color:var(--sf-gilt,#9c7a3e)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="col-span-full border-t border-white/10 pt-6 text-sm leading-relaxed text-white/65 md:col-span-4">
          Jojo&apos;s Shopping Complex
          <br />
          Chang Lam, Thimphu · 02 326275
        </p>
      </div>
      <div className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-white/40 md:px-6">
          <span>© {new Date().getFullYear()} DSB Books · Thimphu</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[color:var(--sf-gilt,#9c7a3e)]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[color:var(--sf-gilt,#9c7a3e)]">
              Terms
            </Link>
            <Link href="/erp/login" className="hover:text-[color:var(--sf-gilt,#9c7a3e)]">
              Staff
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function StorefrontShell({
  children,
  active,
  theme = "atelier",
}: {
  children: React.ReactNode;
  active?: string;
  theme?: StorefrontThemeId;
}) {
  return (
    <div
      data-theme={theme}
      className="sf-paper flex min-h-screen flex-col text-[color:var(--sf-ink)] selection:bg-[color:var(--sf-accent)] selection:text-white"
    >
      <StorefrontHeader active={active} />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
