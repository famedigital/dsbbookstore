import { requireStaff } from "@/lib/erp/auth";
import { ErpShell } from "@/components/erp/erp-shell";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ErpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-lg space-y-4 text-center">
          <p className="text-xs tracking-[0.2em] text-primary uppercase">
            DSB ERP
          </p>
          <h1 className="font-heading text-3xl font-semibold">
            Connect Supabase to run the ERP
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This app uses live Supabase data only — no mock data. Add{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{" "}
            then run the SQL migration in{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
              supabase/migrations
            </code>
            .
          </p>
          <Button asChild>
            <Link href="/">Back to storefront</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { profile } = await requireStaff();

  return <ErpShell profile={profile}>{children}</ErpShell>;
}
