import { CartProvider } from "@/components/storefront/cart-provider";
import { SkipLink } from "@/components/storefront/chrome";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { JsonLd } from "@/components/storefront/json-ld";
import { getStoreSettingsPublic } from "@/lib/cms/get-page";
import { getSiteUrl } from "@/lib/storefront/site";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettingsPublic();
  const siteUrl = getSiteUrl();
  const checkoutEnabled = Boolean(settings.online_checkout_enabled);

  const orgLd = {
    "@context": "https://schema.org",
    "@type": ["BookStore", "Store", "Organization"],
    name: settings.store_name ?? "DSB Books",
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address_line1 ?? "Jojo's Shopping Complex, Chang Lam",
      addressLocality: settings.city ?? "Thimphu",
      addressCountry: settings.country ?? "BT",
    },
    telephone: settings.phone ?? undefined,
    email: settings.email ?? undefined,
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.store_name ?? "DSB Books",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/books?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-[linear-gradient(165deg,#f7f4ec_0%,#e8eef8_42%,#edf5f0_100%)]">
        <SkipLink />
        <JsonLd data={[orgLd, websiteLd]} />
        <SiteHeader checkoutEnabled={checkoutEnabled} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </CartProvider>
  );
}
