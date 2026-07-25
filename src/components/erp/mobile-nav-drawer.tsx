"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  isNavActive,
  navGroupsForRole,
} from "@/components/erp/nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/erp";
import { cn } from "@/lib/utils";

type Props = {
  profile: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MobileNavDrawer({ profile, open, onOpenChange }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const groups = navGroupsForRole(profile.role);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onOpenChange(false);
    router.push("/erp/login");
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="h-full w-[min(100vw-3rem,20rem)] gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&_[data-slot=sheet-close]]:text-sidebar-foreground"
      >
        <SheetHeader className="border-b border-sidebar-border px-5 py-5 text-left">
          <p className="text-[10px] tracking-[0.22em] text-sidebar-primary uppercase">
            DSB Books
          </p>
          <SheetTitle className="font-heading text-xl text-sidebar-foreground">
            ERP Menu
          </SheetTitle>
          <p className="text-xs text-sidebar-foreground/70">
            {profile.full_name ?? profile.email}
            <span className="mt-0.5 block capitalize opacity-80">
              {profile.role}
            </span>
          </p>
        </SheetHeader>

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
                        onClick={() => onOpenChange(false)}
                        className={cn(
                          "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/85 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className="size-5 shrink-0 opacity-90" />
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            variant="ghost"
            className="h-11 w-full justify-start text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={signOut}
          >
            <LogOut className="size-5" />
            Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
