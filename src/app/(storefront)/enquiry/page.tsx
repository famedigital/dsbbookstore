import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { StorefrontShell } from "@/components/storefront/shell";
import { getStorefrontTheme } from "@/lib/storefront/get-theme";
import { submitPublicEnquiry } from "@/lib/erp/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GOOGLE_MAPS_URL, STORE_GEO } from "@/lib/storefront/seo";

export const metadata = {
  title: "Enquiry · DSB Books",
  description:
    "Ask about a title, school orders, or store pickup at DSB Books on Chang Lam, Thimphu.",
};

export default async function EnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; title?: string; message?: string }>;
}) {
  const { sent, title, message } = await searchParams;
  const theme = await getStorefrontTheme();
  const defaultMessage =
    message?.trim() ||
    (title?.trim()
      ? `I would like to enquire about "${title.trim()}".`
      : "I would like to ask about…");

  return (
    <StorefrontShell active="/enquiry" theme={theme}>
      <div className="sf-textile mx-auto w-full max-w-6xl px-3 py-8 sm:px-4 md:px-6 md:py-14">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-12">
          <div>
            <p className="sf-eyebrow">Contact</p>
            <h1 className="sf-title mt-2 text-2xl md:text-4xl">Enquiry</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[color:var(--sf-muted)] md:mt-4 md:text-base">
              Ask about a title, school orders, wholesale, or pickup at Jojo&apos;s
              Shopping Complex on Chang Lam.
            </p>

            <dl className="mt-8 space-y-4 text-sm">
              <div>
                <dt className="text-[0.65rem] tracking-[0.16em] text-[color:var(--sf-muted)] uppercase">
                  Visit
                </dt>
                <dd className="mt-1 text-[color:var(--sf-ink)]">
                  {STORE_GEO.address}
                  <br />
                  {STORE_GEO.city}, Bhutan
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] tracking-[0.16em] text-[color:var(--sf-muted)] uppercase">
                  Phone
                </dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${STORE_GEO.phone.replace(/\s+/g, "")}`}
                    className="font-medium text-[color:var(--sf-accent)] hover:underline"
                  >
                    {STORE_GEO.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[0.65rem] tracking-[0.16em] text-[color:var(--sf-muted)] uppercase">
                  Map
                </dt>
                <dd className="mt-1">
                  <a
                    href={GOOGLE_MAPS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[color:var(--sf-accent)] hover:underline"
                  >
                    Open in Google Maps
                  </a>
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-2">
              <Link href="/books" className="sf-btn-outline !rounded-full text-sm">
                Browse books
              </Link>
              <Link href="/visit" className="sf-btn-pine !rounded-full text-sm">
                Visit us
              </Link>
            </div>
          </div>

          <div>
            {sent === "1" ? (
              <Alert className="rounded-lg border-[color:var(--sf-accent)]/40 bg-[color:var(--sf-surface)]">
                <AlertDescription>
                  Thank you — your enquiry has been sent. We will reply by email.
                </AlertDescription>
              </Alert>
            ) : null}

            {!isSupabaseConfigured() ? (
              <p className="text-sm text-[color:var(--sf-muted)]">
                Connect Supabase to accept enquiries.
              </p>
            ) : sent === "1" ? null : (
              <form
                action={submitPublicEnquiry}
                className="space-y-4 rounded-lg border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] p-5 md:p-6"
              >
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="book_title">Book / subject (optional)</Label>
                  <Input
                    id="book_title"
                    name="book_title"
                    defaultValue={title?.trim() || ""}
                    placeholder="Title you are looking for"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    defaultValue={defaultMessage}
                  />
                </div>
                <Button type="submit" className="sf-btn w-full sm:w-auto">
                  Send enquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
