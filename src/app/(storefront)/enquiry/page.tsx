import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { submitPublicEnquiry } from "@/lib/erp/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata = { title: "Enquiry" };

export default function EnquiryPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ec,#eef2f8)]">
      <header className="mx-auto flex w-full max-w-xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-heading text-2xl font-semibold text-primary">
          DSB Books
        </Link>
        <Link href="/books" className="text-sm hover:text-primary">
          Catalogue
        </Link>
      </header>
      <div className="mx-auto max-w-xl px-6 pb-16">
        <h1 className="font-heading text-4xl font-semibold">Enquiry</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask about a title, school orders, or store pickup in Thimphu.
        </p>
        {!isSupabaseConfigured() ? (
          <p className="mt-8 text-sm text-muted-foreground">
            Connect Supabase to accept enquiries.
          </p>
        ) : (
          <form action={submitPublicEnquiry} className="mt-8 space-y-4 rounded-lg border bg-white/80 p-6">
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
              <Textarea id="message" name="message" required rows={5} />
            </div>
            <Button type="submit">Send</Button>
          </form>
        )}
      </div>
    </div>
  );
}
