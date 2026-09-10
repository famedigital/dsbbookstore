"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Leaf,
  MapPin,
  MonitorSmartphone,
  Package,
  PenLine,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const shop = [
  {
    icon: BookOpen,
    label: "Books",
    description: "Live catalogue with shelf availability",
    href: "/books",
  },
  {
    icon: Package,
    label: "Stationery",
    description: "School and office essentials",
    href: "/stationery",
  },
  {
    icon: PenLine,
    label: "Authors",
    description: "Writers published and stocked at DSB",
    href: "/authors",
  },
  {
    icon: Sparkles,
    label: "DSB Publications",
    description: "Titles from our imprint",
    href: "/publications",
  },
];

const discover = [
  {
    icon: Building2,
    label: "Our Story",
    description: "Family bookstore on Chang Lam",
    href: "/about",
  },
  {
    icon: MonitorSmartphone,
    label: "Digital Lab",
    description: "Digitisation, e-books & archives",
    href: "/digital-lab",
  },
  {
    icon: Globe2,
    label: "Australia Bridge",
    description: "Trade, print & education partners",
    href: "/australia",
  },
  {
    icon: GraduationCap,
    label: "Schools & libraries",
    description: "Supply for classrooms and collections",
    href: "/schools",
  },
  {
    icon: Leaf,
    label: "Impact",
    description: "Earth and community programmes",
    href: "/impact",
  },
  {
    icon: HeartHandshake,
    label: "Partner",
    description: "Publish, distribute, or build with us",
    href: "/partner",
  },
];

const visitLinks = [
  { label: "Visit the shop", href: "/visit" },
  { label: "International orders", href: "/orders" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

function MegaLink({
  href,
  active,
  className,
  children,
}: {
  href: string;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <NavigationMenuLink asChild active={active}>
      <Link href={href} className={cn("w-full", className)}>
        {children}
      </Link>
    </NavigationMenuLink>
  );
}

export function StorefrontMegaNav({ active }: { active?: string }) {
  return (
    <NavigationMenu
      viewport
      className="hidden max-w-none justify-end sm:flex"
    >
      <NavigationMenuList className="gap-0.5">
        <NavigationMenuItem>
          <NavigationMenuLink asChild active={active === "/"}>
            <Link
              href="/"
              className={cn(
                navigationMenuTriggerStyle(),
                "bg-transparent text-[0.78rem] tracking-wide hover:bg-[color:var(--sf-surface)] focus:bg-[color:var(--sf-surface)] data-active:bg-[color:var(--sf-surface)] data-active:text-[color:var(--sf-accent)]",
              )}
            >
              Home
            </Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              "bg-transparent text-[0.78rem] tracking-wide hover:bg-[color:var(--sf-surface)] focus:bg-[color:var(--sf-surface)] data-open:bg-[color:var(--sf-surface)]",
              ["/books", "/stationery", "/authors", "/publications"].includes(
                active ?? "",
              ) && "text-[color:var(--sf-accent)]",
            )}
          >
            Shop
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[min(92vw,42rem)] p-4 md:w-[36rem] md:p-5">
              <div className="grid gap-2 sm:grid-cols-2">
                {shop.map((item) => {
                  const Icon = item.icon;
                  return (
                    <MegaLink
                      key={item.href}
                      href={item.href}
                      active={active === item.href}
                      className="flex flex-row items-start gap-3 rounded-[var(--sf-radius,0.5rem)] border border-transparent p-3 hover:border-[color:var(--sf-line)] hover:bg-[color:var(--sf-surface)]"
                    >
                      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-[color:var(--sf-accent-soft,#efe6d6)] text-[color:var(--sf-accent)]">
                        <Icon className="size-4" />
                      </span>
                      <span>
                        <span className="block font-medium text-[color:var(--sf-ink)]">
                          {item.label}
                        </span>
                        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                          {item.description}
                        </span>
                      </span>
                    </MegaLink>
                  );
                })}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              "bg-transparent text-[0.78rem] tracking-wide hover:bg-[color:var(--sf-surface)] focus:bg-[color:var(--sf-surface)] data-open:bg-[color:var(--sf-surface)]",
              [
                "/about",
                "/digital-lab",
                "/australia",
                "/schools",
                "/impact",
                "/partner",
              ].includes(active ?? "") && "text-[color:var(--sf-accent)]",
            )}
          >
            Discover
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[min(94vw,52rem)] p-4 md:w-[48rem] md:p-5">
              <div className="grid gap-5 md:grid-cols-[1.6fr_1fr]">
                <div>
                  <p className="mb-3 text-[0.65rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    Explore DSB
                  </p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {discover.map((item) => {
                      const Icon = item.icon;
                      return (
                        <MegaLink
                          key={item.href}
                          href={item.href}
                          active={active === item.href}
                          className="flex flex-row items-start gap-2.5 rounded-[var(--sf-radius,0.5rem)] p-2.5 hover:bg-[color:var(--sf-surface)]"
                        >
                          <Icon className="mt-0.5 size-4 shrink-0 text-[color:var(--sf-accent)]" />
                          <span>
                            <span className="block text-sm font-medium text-[color:var(--sf-ink)]">
                              {item.label}
                            </span>
                            <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                              {item.description}
                            </span>
                          </span>
                        </MegaLink>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="relative overflow-hidden rounded-lg border border-[color:var(--sf-line)] bg-[color:var(--sf-surface)] p-4">
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        background:
                          "linear-gradient(135deg, color-mix(in srgb, var(--sf-accent) 18%, transparent), transparent 60%)",
                      }}
                    />
                    <div className="relative space-y-2">
                      <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-[color:var(--sf-accent)] uppercase">
                        On Chang Lam
                      </p>
                      <h4 className="font-heading text-lg text-[color:var(--sf-ink)]">
                        Visit the bookstore
                      </h4>
                      <p className="text-sm leading-snug text-muted-foreground">
                        Jojo&apos;s Shopping Complex · Thimphu · 02 326275
                      </p>
                      <Button asChild size="sm" className="mt-1 w-full sf-btn !rounded-[var(--sf-btn-radius)]">
                        <Link href="/visit">
                          Directions
                          <MapPin />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[color:var(--sf-line)] bg-[color:var(--sf-bg)] p-4">
                    <h4 className="font-medium text-[color:var(--sf-ink)]">
                      Need a title or partnership?
                    </h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Schools, diaspora orders, Digital Lab projects — we reply
                      by email.
                    </p>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                    >
                      <Link href="/enquiry">
                        Send an enquiry
                        <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              "bg-transparent text-[0.78rem] tracking-wide hover:bg-[color:var(--sf-surface)] focus:bg-[color:var(--sf-surface)] data-open:bg-[color:var(--sf-surface)]",
              ["/visit", "/orders", "/enquiry"].includes(active ?? "") &&
                "text-[color:var(--sf-accent)]",
            )}
          >
            Visit
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[min(90vw,18rem)] p-3">
              <div className="space-y-1">
                {visitLinks.map((item) => (
                  <MegaLink
                    key={item.href}
                    href={item.href}
                    active={active === item.href}
                    className="rounded-[var(--sf-radius,0.5rem)] px-3 py-2 text-sm font-medium hover:bg-[color:var(--sf-surface)]"
                  >
                    {item.label}
                  </MegaLink>
                ))}
                <MegaLink
                  href="/enquiry"
                  active={active === "/enquiry"}
                  className="rounded-[var(--sf-radius,0.5rem)] px-3 py-2 text-sm font-medium text-[color:var(--sf-accent)] hover:bg-[color:var(--sf-surface)]"
                >
                  Enquire
                </MegaLink>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
