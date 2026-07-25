"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { isNavActive, navGroupsForRole } from "@/components/erp/nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/erp";
import { cn } from "@/lib/utils";

export function ErpSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const groups = navGroupsForRole(profile.role);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/erp/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:w-64">
      <div className="px-5 py-5">
        <p className="text-[10px] tracking-[0.22em] text-sidebar-primary uppercase">
          DSB Books
        </p>
        <h1 className="mt-1 font-heading text-xl font-semibold">ERP Suite</h1>
        <p className="mt-2 text-xs text-sidebar-foreground/70">
          {profile.full_name ?? profile.email}
          <span className="mt-0.5 block capitalize opacity-80">
            {profile.role}
          </span>
        </p>
      </div>
      <Separator className="bg-sidebar-border" />
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="px-3 pb-1.5 text-[10px] font-medium tracking-[0.18em] text-sidebar-foreground/45 uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isNavActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex min-h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="size-4 shrink-0 opacity-90" />
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="h-10 w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={signOut}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
