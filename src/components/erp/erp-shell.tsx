"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { ErpSidebar } from "@/components/erp/sidebar";
import { MobileBottomNav } from "@/components/erp/mobile-bottom-nav";
import { MobileNavDrawer } from "@/components/erp/mobile-nav-drawer";
import { pageTitleForPath } from "@/components/erp/nav";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/erp";

export function ErpShell({
  profile,
  children,
}: {
  profile: Profile;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const title = pageTitleForPath(pathname);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <ErpSidebar profile={profile} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/80 bg-card/95 px-3 py-2.5 backdrop-blur md:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 shrink-0"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] tracking-[0.18em] text-primary uppercase">
              DSB ERP
            </p>
            <h1 className="truncate font-heading text-base font-semibold leading-tight">
              {title}
            </h1>
          </div>
          <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-[10px] font-medium tracking-wide text-primary capitalize">
            {profile.role}
          </span>
        </header>

        {/* Desktop context bar */}
        <header className="hidden border-b border-border/80 bg-card/80 px-6 py-3 backdrop-blur md:block">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Thimphu · Chang Lam
              </p>
              <h2 className="font-heading text-lg font-medium">{title}</h2>
            </div>
            <p className="text-muted-foreground text-xs capitalize">
              {profile.full_name ?? profile.email} · {profile.role}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      <MobileBottomNav onMore={() => setDrawerOpen(true)} />
      <MobileNavDrawer
        profile={profile}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
