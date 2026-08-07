import Link from "next/link";
import { listAboutChildren, getStoreSettingsPublic } from "@/lib/cms/get-page";

export async function SiteFooter() {
  const [aboutChildren, settings] = await Promise.all([
    listAboutChildren(),
    getStoreSettingsPublic(),
  ]);

  const year = new Date().getFullYear();
  const topAbout = aboutChildren.slice(0, 4);

  return (
    <footer className="mt-auto border-t border-border/70 bg-[#f3efe6]/90">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-heading text-xl font-semibold text-primary">
            DSB Books
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Bhutan&apos;s oldest bookstore and DSB Publication imprint — Thimphu
            on Chang Lam.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/books" className="hover:text-primary">
                Catalogue
              </Link>
            </li>
            <li>
              <Link href="/authors" className="hover:text-primary">
                Authors
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary">
                About
              </Link>
            </li>
            {topAbout.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/${p.slug}`}
                  className="hover:text-primary"
                >
                  {p.nav_label ?? p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Visit
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>{settings.address_line1 ?? "Chang Lam"}</li>
            <li>
              {settings.city ?? "Thimphu"}
              {settings.country ? `, ${settings.country}` : ""}
            </li>
            {settings.opening_hours ? <li>{settings.opening_hours}</li> : null}
            {settings.phone ? <li>{settings.phone}</li> : null}
            {settings.email ? <li>{settings.email}</li> : null}
            <li>
              <Link href="/visit" className="text-foreground hover:text-primary">
                Store details
              </Link>
            </li>
            <li>
              <Link href="/enquiry" className="text-foreground hover:text-primary">
                Enquire
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] text-muted-foreground uppercase">
            Legal
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/privacy" className="hover:text-primary">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-primary">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/erp/login" className="text-muted-foreground hover:text-primary">
                Staff
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 px-6 py-4 text-center text-xs text-muted-foreground">
        © {year} {settings.store_name ?? "DSB Books"} · Thimphu, Bhutan
      </div>
    </footer>
  );
}
