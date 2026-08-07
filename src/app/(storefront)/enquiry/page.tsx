import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { submitPublicEnquiry } from "@/lib/erp/actions";
import { getCmsPage } from "@/lib/cms/get-page";
import { MarkdownBody } from "@/components/storefront/markdown-body";
import { ENQUIRY_TOPICS } from "@/lib/cms/fallback-content";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SubmitButton } from "@/components/storefront/submit-button";
import { getSiteUrl } from "@/lib/storefront/site";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPage("enquiry");
  return {
    title: page?.seo_title ?? "Enquiry",
    description: page?.seo_description ?? page?.subtitle ?? undefined,
    alternates: { canonical: `${getSiteUrl()}/enquiry` },
  };
}

export default async function EnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; topic?: string }>;
}) {
  const { sent, topic } = await searchParams;
  const page = await getCmsPage("enquiry");
  const defaultTopic =
    ENQUIRY_TOPICS.some((t) => t.value === topic) ? topic : "general";

  return (
    <div className="mx-auto max-w-xl px-6 py-12 pb-20">
      <h1 className="font-heading text-4xl font-semibold">
        {page?.title ?? "Enquiry"}
      </h1>
      {page?.subtitle ? (
        <p className="mt-2 text-sm text-muted-foreground">{page.subtitle}</p>
      ) : null}
      {page?.body_md ? (
        <div className="mt-4 text-sm">
          <MarkdownBody content={page.body_md} />
        </div>
      ) : null}

      {sent === "1" ? (
        <Alert className="mt-8 border-primary/30 bg-white/90" role="status" aria-live="polite">
          <AlertDescription>
            Thank you — your enquiry has been sent. We will reply by email.
          </AlertDescription>
        </Alert>
      ) : null}

      {!isSupabaseConfigured() ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Connect Supabase to accept enquiries.
        </p>
      ) : sent === "1" ? null : (
        <form
          action={submitPublicEnquiry}
          className="mt-8 space-y-4 rounded-lg border bg-white/80 p-6"
        >
          {/* Honeypot */}
          <div className="absolute -left-[9999px] opacity-0" aria-hidden>
            <Label htmlFor="company_website">Company website</Label>
            <Input
              id="company_website"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="topic">Topic</Label>
            <select
              id="topic"
              name="topic"
              defaultValue={defaultTopic}
              className="border-input bg-background h-9 w-full rounded-lg border px-3 text-sm"
            >
              {ENQUIRY_TOPICS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
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
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" required rows={5} minLength={10} />
          </div>
          <SubmitButton>Send</SubmitButton>
        </form>
      )}
    </div>
  );
}
