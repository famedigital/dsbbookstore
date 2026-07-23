import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { submitPublicEnquiry } from "@/lib/erp/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const metadata = { title: "Visit" };

export default async function VisitPage() {
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ec,#e8f0ea)]">
      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-heading text-2xl font-semibold text-primary">
          DSB Books
        </Link>
        <Link href="/books" className="text-sm hover:text-primary">
          Catalogue
        </Link>
      </header>
      <div className="mx-auto max-w-3xl px-6 pb-16">
        <h1 className="font-heading text-4xl font-semibold">Visit the store</h1>
        <p className="mt-3 text-muted-foreground">
          {settings.store_name} — Bhutan&apos;s oldest bookstore in Thimphu.
        </p>
        <div className="mt-8 space-y-2 rounded-lg border bg-white/70 p-6 text-sm leading-relaxed">
          <p>{settings.address_line1}</p>
          <p>{settings.city}, Bhutan</p>
          {settings.opening_hours ? <p>Hours: {settings.opening_hours}</p> : null}
          {settings.phone ? <p>Phone: {settings.phone}</p> : null}
          {settings.email ? <p>Email: {settings.email}</p> : null}
        </div>
        <Button asChild className="mt-6">
          <Link href="/enquiry">Send an enquiry</Link>
        </Button>
      </div>
    </div>
  );
}
