import { isSupabaseConfigured } from "@/lib/supabase/server";
import { StorefrontShell } from "@/components/storefront/shell";
import { submitPublicEnquiry } from "@/lib/erp/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const metadata = { title: "Enquiry" };

export default async function EnquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <StorefrontShell active="/enquiry">
      <div className="mx-auto w-full max-w-xl px-6 py-14 md:py-20">
        <p className="text-[0.65rem] tracking-[0.28em] text-[color:var(--dsb-gilt)] uppercase">
          Contact
        </p>
        <h1 className="mt-3 font-heading text-5xl font-semibold tracking-[-0.02em]">
          Enquiry
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Ask about a title, school orders, or store pickup in Thimphu.
        </p>

        {sent === "1" ? (
          <Alert className="mt-8 rounded-none border-[color:var(--dsb-gilt)]/40 bg-[color:var(--dsb-stone)]/50">
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
            className="mt-10 space-y-4 border border-[color:var(--dsb-line)] bg-[color:var(--dsb-stone)]/35 p-6"
          >
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required className="rounded-none" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="rounded-none"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" className="rounded-none" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                required
                rows={5}
                className="rounded-none"
              />
            </div>
            <Button
              type="submit"
              className="rounded-none bg-[color:var(--dsb-lacquer)] hover:bg-[#4a1c16]"
            >
              Send
            </Button>
          </form>
        )}
      </div>
    </StorefrontShell>
  );
}
