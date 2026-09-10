import Link from "next/link";
import type { StorefrontThemeId } from "@/lib/storefront/themes";
import {
  PRIMARY_NAV,
  FOOTER_SHOP,
  FOOTER_ABOUT,
} from "@/lib/storefront/institutional";

export function StorefrontHeader({ active }: { active?: string }) {
  const mobileNav = PRIMARY_NAV.filter((item) => item.href !== "/");

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--sf-line)]/70 bg-[color:var(--sf-bg)]/90 backdrop-blur-xl sf-dzong-top">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2.5 md:gap-4 md:px-6 md:py-3.5">
        <Link
          href="/"
          className="shrink-0 font-heading text-xl tracking-tight text-[color:var(--sf-ink)] md:text-2xl"
        >
          DSB
          <span className="text-[color:var(--sf-accent)]">Books</span>
        </Link>
        <nav className="hidden items-center gap-5 text-[0.8rem] font-medium tracking-wide text-[color:var(--sf-ink)] lg:flex xl:gap-6">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sf-link-gilt whitespace-nowrap ${
                active === item.href
                  ? "text-[color:var(--sf-accent)]"
                  : "text-[color:var(--sf-ink)]/80"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 md:gap-3">
          <Link href="/books" className="sf-btn !px-3 !py-1.5 text-xs">
            Shop
          </Link>
        </div>
      </div>
      <nav className="border-t border-[color:var(--sf-line)] lg:hidden">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-1.5 text-xs font-medium whitespace-nowrap">
          {mobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-sm px-3 py-1 transition-colors ${
                active === item.href
                  ? "bg-[color:var(--sf-accent)] text-white"
                  : "text-[color:var(--sf-muted)] hover:text-[color:var(--sf-accent)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="sf-textile mt-auto bg-[color:var(--sf-night,#1a2430)] text-[color:var(--sf-ivory,#f7f2e8)] sf-dzong-top">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-4 md:gap-10 md:px-6 md:py-14">
        <div className="md:col-span-1">
          <p className="font-heading text-2xl md:text-3xl">
            DSB
            <span className="text-[color:var(--sf-gilt,#9c7a3e)]">Books</span>
          </p>
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
