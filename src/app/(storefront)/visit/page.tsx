import Image from "next/image";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Visit" };

export default async function VisitPage() {
  const theme = await getStorefrontTheme();
  let settings = {
    store_name: "DSB Books",
    address_line1: "Jojo's Shopping Complex, Chang Lam",
    city: "Thimphu",
    phone: null as string | null,
    opening_hours: null as string | null,
    email: null as string | null,
  };

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (data) settings = { ...settings, ...data };
  }

  return (
    <StorefrontShell active="/visit" theme={theme}>
      <div className="relative isolate min-h-[48vh] overflow-hidden bg-[color:var(--dsb-ink)]">
        <Image
          src="/images/hero-dsb-exterior.jpg"
          alt="DSB BOOKS sign beside Chang Lam, Thimphu"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%] opacity-90"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(20,17,15,0.88),rgba(20,17,15,0.35))]" />
        <div className="relative z-10 mx-auto flex min-h-[48vh] w-full max-w-6xl items-end px-6 pb-14 pt-24">
          <div className="max-w-xl text-[color:var(--dsb-ivory)]">
            <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
              Chang Lam · Clock Tower
            </p>
            <h1 className="mt-3 font-heading text-5xl font-semibold tracking-[-0.02em] md:text-6xl">
              Visit the store
            </h1>
            <p className="mt-4 text-base text-[color:var(--dsb-ivory)]/75">
              {settings.store_name} — Bhutan&apos;s oldest bookstore in Thimphu.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
        <div className="space-y-6 text-sm leading-relaxed">
          <div>
            <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
              Address
            </p>
            <p className="mt-3 text-base">
              {settings.address_line1}
              <br />
              {settings.city}, Bhutan
            </p>
            <p className="mt-2 text-muted-foreground">
              Ground floor, Jojo&apos;s Shopping Complex — look for the blue
              DSB BOOKS sign near Druk Hotel.
            </p>
          </div>
          {settings.opening_hours ? (
            <div>
              <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
                Hours
              </p>
              <p className="mt-3 text-base">{settings.opening_hours}</p>
            </div>
          ) : (
            <div>
              <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
                Hours
              </p>
              <p className="mt-3 text-base">Typically 9:00 – 20:00</p>
            </div>
          )}
          {settings.phone ? (
            <div>
              <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
                Phone
              </p>
              <p className="mt-3 text-base">{settings.phone}</p>
            </div>
          ) : (
            <div>
              <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
                Phone
              </p>
              <p className="mt-3 text-base">02 326275 · 02 326270 · 02 323122</p>
            </div>
          )}
          {settings.email ? (
            <div>
              <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
                Email
              </p>
              <p className="mt-3 text-base">{settings.email}</p>
            </div>
          ) : null}
          <Button
            asChild
            className="rounded-none bg-[color:var(--dsb-lacquer)] hover:bg-[#4a1c16]"
          >
            <Link href="/enquiry">Send an enquiry</Link>
          </Button>
        </div>

        <div className="grid gap-3">
          <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--dsb-stone)]">
            <Image
              src="/images/hero-dsb-interior.jpg"
              alt="Bhutan Books shelves inside DSB Books"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[16/10] overflow-hidden bg-[color:var(--dsb-stone)]">
            <Image
              src="/images/hero-dsb-magazines.jpg"
              alt="Magazines and periodicals at DSB Books"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
