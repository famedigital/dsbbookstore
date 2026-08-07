import type { Metadata } from "next";
import Link from "next/link";
import { getCmsPage, getStoreSettingsPublic } from "@/lib/cms/get-page";
import { MarkdownBody } from "@/components/storefront/markdown-body";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/storefront/site";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("visit");
  return {
    title: page?.seo_title ?? "Visit",
    description: page?.seo_description ?? page?.subtitle ?? undefined,
    alternates: { canonical: `${getSiteUrl()}/visit` },
  };
}

export default async function VisitPage() {
  const [page, settings] = await Promise.all([
    getCmsPage("visit"),
    getStoreSettingsPublic(),
  ]);

  const mapQuery = encodeURIComponent(
    `${settings.address_line1 ?? "Chang Lam"}, ${settings.city ?? "Thimphu"}, Bhutan`
  );

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 pb-20">
      <h1 className="font-heading text-4xl font-semibold">
        {page?.title ?? "Visit the store"}
      </h1>
      {page?.subtitle ? (
        <p className="mt-3 text-muted-foreground">{page.subtitle}</p>
      ) : null}
      {page?.body_md ? (
        <div className="mt-6">
          <MarkdownBody content={page.body_md} />
        </div>
      ) : null}

      <div className="mt-8 space-y-2 rounded-lg border bg-white/70 p-6 text-sm leading-relaxed">
        <p className="font-medium">{settings.store_name ?? "DSB Books"}</p>
        <p>{settings.address_line1}</p>
        <p>
          {settings.city}
          {settings.country ? `, ${settings.country}` : ""}
        </p>
        {settings.opening_hours ? <p>Hours: {settings.opening_hours}</p> : null}
        {settings.phone ? <p>Phone: {settings.phone}</p> : null}
        {settings.email ? <p>Email: {settings.email}</p> : null}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border bg-white/70">
        <iframe
          title="Map to DSB Books"
          className="h-64 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed`}
        />
      </div>

      <Button asChild className="mt-6">
        <Link href="/enquiry">Send an enquiry</Link>
      </Button>
    </div>
  );
}
