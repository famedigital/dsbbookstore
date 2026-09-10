"use client";

import { navForRole, OFFICE_DOCK, type NavItem } from "@/components/erp/nav";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/erp";
import { cn } from "@/lib/utils";
import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function isActive(pathname: string, href: string) {
  if (href === "/erp") return pathname === "/erp";
  if (href === "/erp/counter") {
    return pathname === "/erp/counter" || pathname.startsWith("/erp/counter/");
  }
  return pathname.startsWith(href);
}

function NavLinks({
  items,
  pathname,
  onNavigate,
  compact = false,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  return (
    <nav className={cn("space-y-1", compact ? "px-2 py-3" : "px-3 py-4")}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
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
  );
}

export function DeskSwitch({
  pathname,
  className,
  tone = "light",
}: {
  pathname: string;
  className?: string;
  tone?: "light" | "dark";
}) {
  const onCounter = isActive(pathname, "/erp/counter");
  return (
    <div
      className={cn(
        "inline-flex rounded-md border p-0.5 text-xs font-semibold",
        tone === "dark"
          ? "border-white/15 bg-white/10"
          : "border-border bg-muted/40",
        className
      )}
    >
      <Link
        href="/erp/counter"
        className={cn(
          "rounded-sm px-3 py-1.5 transition-colors",
          onCounter
            ? "bg-primary text-primary-foreground"
            : tone === "dark"
              ? "text-white/65 hover:text-white"
              : "text-muted-foreground hover:text-foreground"
        )}
      >
        Counter
      </Link>
      <Link
        href="/erp"
        className={cn(
          "rounded-sm px-3 py-1.5 transition-colors",
          !onCounter
            ? "bg-primary text-primary-foreground"
            : tone === "dark"
              ? "text-white/65 hover:text-white"
              : "text-muted-foreground hover:text-foreground"
        )}
      >
        Office
      </Link>
    </div>
  );
}

export function ErpSidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navForRole(profile.role);
  const [menuOpen, setMenuOpen] = useState(false);
  const onCounter = isActive(pathname, "/erp/counter");

  // Never keep ERP menu open on Counter — Alt+L belongs to the items picker.
  useEffect(() => {
    if (onCounter) setMenuOpen(false);
  }, [onCounter]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/erp/login");
    router.refresh();
  }

  // Counter desk: only brand + desk switch. No burger, dock, or Sheet.
  if (onCounter) {
    return (
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-[#14110f] px-4 py-2 text-[#f7f2e8]">
        <p className="font-heading text-base tracking-tight md:text-lg">
          DSB <span className="text-[#c9a227]">Counter</span>
        </p>
        <DeskSwitch pathname={pathname} tone="dark" />
      </header>
    );
  }

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="px-5 py-6">
          <p className="text-xs tracking-[0.2em] text-sidebar-primary uppercase">
            DSB Books
          </p>
          <h1 className="mt-1 font-heading text-xl font-semibold">Office</h1>
          <p className="mt-2 text-xs text-sidebar-foreground/70">
            {profile.full_name ?? profile.email}
            <span className="mt-1 block capitalize opacity-80">
              {profile.role}
            </span>
          </p>
          <DeskSwitch
            pathname={pathname}
            className="mt-4 w-full justify-stretch [&_a]:flex-1 [&_a]:text-center"
          />
        </div>
        <Separator className="bg-sidebar-border" />
        <div className="flex-1 overflow-y-auto">
          <NavLinks items={items} pathname={pathname} />
        </div>
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

      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="size-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] tracking-[0.18em] text-primary uppercase">
            Office
          </p>
          <p className="truncate text-sm font-medium">
            {profile.full_name ?? profile.email}
          </p>
        </div>
        <DeskSwitch pathname={pathname} />
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Primary ERP navigation"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {OFFICE_DOCK.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-1 py-2 text-[0.65rem] font-medium",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="size-5" />
                  <span className="truncate">{item.title}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className={cn(
                "flex w-full flex-col items-center gap-0.5 px-1 py-2 text-[0.65rem] font-medium",
                menuOpen ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Menu className="size-5" />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="w-[min(100vw-3rem,20rem)] max-w-[85vw] bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetHeader className="border-b border-sidebar-border px-5 py-5 text-left">
            <SheetTitle className="font-heading text-sidebar-foreground">
              DSB Books
            </SheetTitle>
            <p className="text-xs text-sidebar-foreground/70">
              {profile.full_name ?? profile.email}
              <span className="mt-1 block capitalize opacity-80">
                {profile.role}
              </span>
            </p>
            <DeskSwitch
              pathname={pathname}
              className="mt-3 w-full justify-stretch bg-sidebar-accent/40 [&_a]:flex-1 [&_a]:text-center"
            />
          </SheetHeader>
          <div className="flex h-[calc(100%-10rem)] flex-col">
            <div className="flex-1 overflow-y-auto">
              <NavLinks
                items={items}
                pathname={pathname}
                onNavigate={() => setMenuOpen(false)}
                compact
              />
            </div>
            <div className="border-t border-sidebar-border p-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut();
                }}
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
