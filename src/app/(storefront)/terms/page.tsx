import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";

export const metadata = { title: "Terms of Use" };

export default async function TermsPage() {
  const theme = await getStorefrontTheme();
  return (
    <StorefrontShell theme={theme}>
      <article className="prose prose-neutral mx-auto max-w-3xl px-6 py-14 md:py-20">
        <h1 className="font-heading">Terms of Use</h1>
        <p>
          By using the DSB Books website you agree to these terms. The site
          provides catalogue information and enquiry forms; online checkout may
          be added in a future phase.
        </p>
        <h2>Catalogue &amp; availability</h2>
        <p>
          Stock levels and prices are shown in good faith from our inventory
          system. Availability may change before we respond to your enquiry.
          Published prices are in Bhutanese Ngultrum (BTN) unless stated
          otherwise.
        </p>
        <h2>Enquiries</h2>
        <p>
          Submitting an enquiry does not create a binding order. Our staff will
          confirm availability, pricing, and pickup or delivery options by
          email or phone.
        </p>
        <h2>Intellectual property</h2>
        <p>
          Book covers, descriptions, and site content remain the property of
          DSB Books, publishers, and respective rights holders. Do not reproduce
          without permission.
        </p>
        <h2>Limitation</h2>
        <p>
          The site is provided as-is. DSB Books is not liable for indirect
          damages arising from use of this website or reliance on catalogue
          data.
        </p>
      </article>
    </StorefrontShell>
  );
}
