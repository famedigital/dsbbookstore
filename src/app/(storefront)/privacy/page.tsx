import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import Link from "next/link";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const theme = await getStorefrontTheme();
  return (
    <StorefrontShell theme={theme}>
      <article className="prose prose-neutral mx-auto max-w-3xl px-6 py-14 md:py-20">
        <h1 className="font-heading">Privacy Policy</h1>
        <p>
          DSB Books (Thimphu) respects your privacy. This page describes how we
          handle information submitted through our website.
        </p>
        <h2>Information we collect</h2>
        <p>
          When you submit an enquiry, we collect your name, email address,
          optional phone number, and message. Staff ERP users authenticate via
          Supabase Auth; their profile and role are stored for access control.
        </p>
        <h2>How we use it</h2>
        <p>
          Enquiry details are used to respond to your request about books,
          orders, or store visits. We do not sell personal data to third parties.
        </p>
        <h2>Retention</h2>
        <p>
          Enquiries are retained in our database for customer service and
          operational records. Contact us to request deletion where applicable
          under local law.
        </p>
        <h2>Contact</h2>
        <p>
          Questions about privacy: visit our{" "}
          <Link href="/visit">store page</Link> or use the{" "}
          <Link href="/enquiry">enquiry form</Link>.
        </p>
      </article>
    </StorefrontShell>
  );
}
