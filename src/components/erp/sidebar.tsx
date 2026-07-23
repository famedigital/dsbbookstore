"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { navForRole } from "@/components/erp/nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/erp";
import { cn } from "@/lib/utils";

export function ErpSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navForRole(profile.role);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/erp/login");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-6">
        <p className="text-xs tracking-[0.2em] text-sidebar-primary uppercase">
          DSB Books
        </p>
        <h1 className="mt-1 font-heading text-xl font-semibold">ERP Suite</h1>
        <p className="mt-2 text-xs text-sidebar-foreground/70">
          {profile.full_name ?? profile.email}
          <span className="mt-1 block capitalize opacity-80">{profile.role}</span>
        </p>
      </div>
      <Separator className="bg-sidebar-border" />
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => {
          const active =
            item.href === "/erp"
              ? pathname === "/erp"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0 opacity-90" />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={signOut}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
