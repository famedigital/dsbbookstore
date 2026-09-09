import Link from "next/link";
import type { StorefrontThemeId } from "@/lib/storefront/themes";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Catalogue" },
  { href: "/authors", label: "Authors" },
  { href: "/visit", label: "Visit" },
  { href: "/enquiry", label: "Enquire" },
] as const;

export function StorefrontHeader({
  active,
}: {
  active?: (typeof NAV)[number]["href"];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--sf-line)] bg-[color:var(--sf-bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="font-heading text-2xl text-[color:var(--sf-ink)] md:text-3xl">
          DSB<span className="text-[color:var(--sf-accent)]">Books</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[color:var(--sf-ink)] md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors hover:text-[color:var(--sf-accent)] ${
                active === item.href ? "text-[color:var(--sf-accent)]" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/enquiry"
            className="hidden text-sm text-[color:var(--sf-muted)] hover:text-[color:var(--sf-accent)] sm:inline"
          >
            Account
          </Link>
          <Link href="/books" className="sf-btn !px-4 !py-2 text-xs">
            Shop
          </Link>
        </div>
      </div>
    </header>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="mt-auto bg-[color:var(--sf-ink)] text-white">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-heading text-3xl">
            DSB<span className="text-[color:var(--sf-accent)]">Books</span>
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65">
            Bhutan&apos;s oldest bookstore on Chang Lam. Browse DSB Publication
            titles and check what&apos;s on the shelf in Thimphu.
          </p>
        </div>
        <div>
          <p className="sf-eyebrow text-[color:var(--sf-accent)]">Explore</p>
          <ul className="mt-4 space-y-2 text-sm text-white/70">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-[color:var(--sf-accent)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="sf-eyebrow text-[color:var(--sf-accent)]">Visit</p>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Jojo&apos;s Shopping Complex
            <br />
            Chang Lam, Thimphu
            <br />
            02 326275
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-xs text-white/45">
          <span>© {new Date().getFullYear()} DSB Books</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[color:var(--sf-accent)]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[color:var(--sf-accent)]">
              Terms
            </Link>
            <Link href="/erp/login" className="hover:text-[color:var(--sf-accent)]">
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
  theme = "uikit",
}: {
  children: React.ReactNode;
  active?: (typeof NAV)[number]["href"];
  theme?: StorefrontThemeId;
}) {
  return (
    <div
      data-theme={theme}
      className="flex min-h-screen flex-col bg-[color:var(--sf-bg)] text-[color:var(--sf-ink)]"
    >
      <StorefrontHeader active={active} />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
