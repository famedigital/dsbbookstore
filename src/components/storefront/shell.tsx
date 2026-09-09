import Link from "next/link";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/books", label: "Catalogue" },
  { href: "/authors", label: "Authors" },
  { href: "/visit", label: "Visit" },
  { href: "/enquiry", label: "Enquire" },
] as const;

export function StorefrontHeader({
  active,
}: {
  active?: (typeof NAV)[number]["href"] | "/";
}) {
  return (
    <header className="relative z-20 border-b border-[color:var(--dsb-line)]/70 bg-[color:var(--dsb-ivory)]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <Link href="/" className="group min-w-0">
          <span className="font-heading text-[1.65rem] leading-none font-semibold tracking-[-0.02em] text-[color:var(--dsb-ink)] transition-colors group-hover:text-[color:var(--dsb-lacquer)]">
            DSB Books
          </span>
          <span className="mt-1 block text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
            Thimphu · Est. bookstore
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-[0.8rem] tracking-[0.14em] text-[color:var(--dsb-ink)]/70 uppercase md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors hover:text-[color:var(--dsb-lacquer)] ${
                active === item.href
                  ? "text-[color:var(--dsb-lacquer)]"
                  : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Button
            asChild
            size="sm"
            variant="outline"
            className="ml-1 rounded-none border-[color:var(--dsb-ink)]/20 bg-transparent px-3 tracking-[0.12em] uppercase"
          >
            <Link href="/erp/login">Staff</Link>
          </Button>
        </nav>
        <nav className="flex items-center gap-3 text-xs tracking-[0.12em] uppercase md:hidden">
          <Link href="/books" className="text-[color:var(--dsb-lacquer)]">
            Catalogue
          </Link>
          <Link href="/erp/login" className="text-[color:var(--dsb-ink)]/55">
            Staff
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="mt-auto border-t border-[color:var(--dsb-line)] bg-[color:var(--dsb-ink)] text-[color:var(--dsb-ivory)]">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-heading text-3xl tracking-[-0.02em]">DSB Books</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[color:var(--dsb-ivory)]/65">
            Bhutan&apos;s oldest bookstore on Chang Lam — a living catalogue of
            DSB Publication titles and the shelves of Thimphu.
          </p>
        </div>
        <div>
          <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
            Visit
          </p>
          <p className="mt-4 text-sm leading-relaxed text-[color:var(--dsb-ivory)]/75">
            Jojo&apos;s Shopping Complex
            <br />
            Chang Lam, Thimphu
            <br />
            Bhutan
          </p>
        </div>
        <div>
          <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
            Explore
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[color:var(--dsb-ivory)]/75">
            <li>
              <Link href="/books" className="hover:text-[color:var(--dsb-gilt)]">
                Catalogue
              </Link>
            </li>
            <li>
              <Link href="/authors" className="hover:text-[color:var(--dsb-gilt)]">
                Authors
              </Link>
            </li>
            <li>
              <Link href="/visit" className="hover:text-[color:var(--dsb-gilt)]">
                Visit the store
              </Link>
            </li>
            <li>
              <Link href="/enquiry" className="hover:text-[color:var(--dsb-gilt)]">
                Enquire
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-5 text-[0.7rem] tracking-[0.12em] text-[color:var(--dsb-ivory)]/45 uppercase">
          <span>© {new Date().getFullYear()} DSB Books</span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-[color:var(--dsb-gilt)]">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[color:var(--dsb-gilt)]">
              Terms
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
}: {
  children: React.ReactNode;
  active?: (typeof NAV)[number]["href"] | "/";
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[color:var(--dsb-ivory)] text-[color:var(--dsb-ink)]">
      <StorefrontHeader active={active} />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
    </div>
  );
}
