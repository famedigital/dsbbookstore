"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PRIMARY_NAV, isNavActive } from "@/lib/storefront/site";
import { useCart } from "@/components/storefront/cart-provider";
import { useState } from "react";

const ABOUT_LINKS = [
  { href: "/about", label: "About hub" },
  { href: "/about/founder", label: "Founder & family" },
  { href: "/about/publications", label: "Publications" },
  { href: "/about/bhutan-australia", label: "Bhutan–Australia" },
  { href: "/about/schools-universities-libraries", label: "Schools & libraries" },
  { href: "/about/digital-knowledge-lab", label: "Digital Knowledge Lab" },
  { href: "/about/earth-community", label: "Earth & community" },
  { href: "/about/partner", label: "Partner" },
  { href: "/about/international-orders", label: "International orders" },
];

export function SiteHeader({
  checkoutEnabled = false,
}: {
  checkoutEnabled?: boolean;
}) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-[#f7f4ec]/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="font-heading text-2xl font-semibold text-primary focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          DSB Books
        </Link>

        <nav
          className="hidden items-center gap-5 text-sm md:flex"
          aria-label="Primary"
        >
          {PRIMARY_NAV.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`focus-visible:ring-ring rounded-sm focus-visible:ring-2 focus-visible:outline-none ${
                  active
                    ? "font-medium text-primary"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {checkoutEnabled ? (
            <Link
              href="/cart"
              className="focus-visible:ring-ring relative inline-flex items-center gap-1 rounded-sm hover:text-primary focus-visible:ring-2 focus-visible:outline-none"
              aria-label={`Cart, ${itemCount} items`}
            >
              <ShoppingBag className="size-4" />
              {itemCount > 0 ? (
                <span className="bg-primary text-primary-foreground absolute -top-2 -right-3 flex size-4 items-center justify-center rounded-full text-[10px]">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {checkoutEnabled ? (
            <Link
              href="/cart"
              className="relative inline-flex size-10 items-center justify-center rounded-md hover:bg-black/5"
              aria-label={`Cart, ${itemCount} items`}
            >
              <ShoppingBag className="size-5" />
              {itemCount > 0 ? (
                <span className="bg-primary text-primary-foreground absolute top-1 right-1 flex size-4 items-center justify-center rounded-full text-[10px]">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          ) : null}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
                className="size-10"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,20rem)]">
              <SheetHeader>
                <SheetTitle className="font-heading text-left">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
                {PRIMARY_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="min-h-11 rounded-md px-3 py-2 text-base hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                <p className="text-muted-foreground mt-4 px-3 text-xs tracking-wide uppercase">
                  About
                </p>
                {ABOUT_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground min-h-10 rounded-md px-3 py-2 text-sm hover:bg-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href="/privacy"
                  onClick={() => setOpen(false)}
                  className="mt-4 min-h-10 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  onClick={() => setOpen(false)}
                  className="min-h-10 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  Terms
                </Link>
                <Link
                  href="/erp/login"
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground min-h-10 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  Staff
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
