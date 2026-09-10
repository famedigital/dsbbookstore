import Image from "next/image";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";

export const metadata = { title: "Visit" };

export default async function VisitPage() {
  const theme = await getStorefrontTheme();
  let settings = {
    store_name: "DSB Books",
    address_line1: "Jojo's Shopping Complex, Chang Lam",
    city: "Thimphu",
    country: "Bhutan",
    phone: "02 326275",
    opening_hours: "Typically 9:00 – 20:00",
    email: null as string | null,
    visit_directions:
      "Ground floor, Jojo's Shopping Complex — look for the blue DSB BOOKS sign near Druk Hotel.",
    public_tagline:
      "Bhutan's oldest bookstore on Chang Lam — books, stationery, and enquiries welcome.",
  };

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (data) {
      settings = {
        ...settings,
        ...data,
        phone: data.phone || settings.phone,
        opening_hours: data.opening_hours || settings.opening_hours,
        visit_directions: data.visit_directions || settings.visit_directions,
        public_tagline: data.public_tagline || settings.public_tagline,
      };
    }
  }

  const mapsQuery = encodeURIComponent(
    [settings.address_line1, settings.city, settings.country || "Bhutan"]
      .filter(Boolean)
      .join(", ")
  );

  return (
    <StorefrontShell active="/visit" theme={theme}>
      {/* Full-bleed hero — brand first */}
      <section className="relative isolate min-h-[38vh] overflow-hidden md:min-h-[70vh]">
        <Image
          src="/images/hero-dsb-exterior.jpg"
          alt="DSB BOOKS on Chang Lam, Thimphu"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_28%] scale-105 animate-[sf-rise_1.1s_ease_both]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(20,17,15,0.92)_0%,rgba(20,17,15,0.55)_48%,rgba(20,17,15,0.25)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(92,36,28,0.35),transparent_55%)]" />

        <div className="relative z-10 mx-auto flex min-h-[38vh] w-full max-w-6xl flex-col justify-end px-3 pb-7 pt-10 sm:px-4 md:min-h-[70vh] md:px-6 md:pb-16 md:pt-20">
          <p className="sf-eyebrow text-[color:var(--dsb-gilt)] sf-rise">
            Chang Lam · Thimphu
          </p>
          <h1 className="sf-rise-delay mt-2 font-heading text-[clamp(1.75rem,5vw,4.25rem)] tracking-[-0.03em] text-[color:var(--dsb-ivory)] md:mt-3">
            {settings.store_name}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[color:var(--dsb-ivory)]/75 md:mt-5 md:text-base">
            {settings.public_tagline}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 md:mt-8 md:gap-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
              target="_blank"
              rel="noreferrer"
              className="sf-btn !px-5 !py-2.5"
            >
              Open in Maps
            </a>
            <Link href="/enquiry" className="sf-btn-outline !px-5 !py-2.5">
              Enquire
            </Link>
          </div>
        </div>
      </section>

      {/* One job: how to find us */}
      <section className="border-b border-[color:var(--sf-line)] bg-[color:var(--sf-surface)]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-12 md:gap-10 md:px-6 md:py-14">
          <div className="md:col-span-5">
            <p className="sf-eyebrow">Find us</p>
            <h2 className="sf-title mt-2">On Chang Lam</h2>
            <p className="mt-3 text-sm leading-relaxed text-[color:var(--sf-muted)] md:text-base">
              {settings.visit_directions}
            </p>
          </div>
          <dl className="grid gap-6 sm:grid-cols-2 md:col-span-7 md:gap-8">
            <div>
              <dt className="text-[0.65rem] font-semibold tracking-[0.2em] text-[color:var(--sf-accent)] uppercase">
                Address
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-[color:var(--sf-ink)] md:text-base">
                {settings.address_line1}
                <br />
                {settings.city}
                {settings.country ? `, ${settings.country}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-semibold tracking-[0.2em] text-[color:var(--sf-accent)] uppercase">
                Hours
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-[color:var(--sf-ink)] md:text-base whitespace-pre-line">
                {settings.opening_hours}
              </dd>
            </div>
            <div>
              <dt className="text-[0.65rem] font-semibold tracking-[0.2em] text-[color:var(--sf-accent)] uppercase">
                Phone
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-[color:var(--sf-ink)] md:text-base">
                <a
                  href={`tel:${String(settings.phone).replace(/\s/g, "")}`}
                  className="hover:text-[color:var(--sf-accent)]"
                >
                  {settings.phone}
                </a>
              </dd>
            </div>
            {settings.email ? (
              <div>
                <dt className="text-[0.65rem] font-semibold tracking-[0.2em] text-[color:var(--sf-accent)] uppercase">
                  Email
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-[color:var(--sf-ink)] md:text-base">
                  <a
                    href={`mailto:${settings.email}`}
                    className="hover:text-[color:var(--sf-accent)]"
                  >
                    {settings.email}
                  </a>
                </dd>
              </div>
            ) : (
              <div>
                <dt className="text-[0.65rem] font-semibold tracking-[0.2em] text-[color:var(--sf-accent)] uppercase">
                  Also
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-[color:var(--sf-ink)] md:text-base">
                  02 326270 · 02 323122
                </dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      {/* Atmosphere — one visual plane */}
      <section className="relative isolate min-h-[42vh] overflow-hidden md:min-h-[52vh]">
        <Image
          src="/images/hero-dsb-interior.jpg"
          alt="Shelves inside DSB Books"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,17,15,0.75),rgba(20,17,15,0.15))]" />
        <div className="relative z-10 mx-auto flex min-h-[42vh] w-full max-w-6xl items-end px-4 pb-8 md:min-h-[52vh] md:px-6 md:pb-12">
          <div className="max-w-lg text-[color:var(--dsb-ivory)]">
            <p className="sf-eyebrow text-[color:var(--dsb-gilt)]">Inside the shop</p>
            <p className="mt-2 font-heading text-2xl tracking-tight md:text-3xl">
              Browse books and stationery on the ground floor.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/books" className="sf-btn !px-4 !py-2 text-sm">
                Books
              </Link>
              <Link href="/stationery" className="sf-btn-outline !px-4 !py-2 text-sm">
                Stationery
              </Link>
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
