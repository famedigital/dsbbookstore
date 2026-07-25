"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, MessageSquare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/books", label: "Catalogue", icon: BookOpen },
  { href: "/authors", label: "Authors", icon: Users },
  { href: "/enquiry", label: "Enquire", icon: MessageSquare },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-[#0b3d91]/12 bg-[#f7f4ec]/95 text-[#0b3d91] shadow-[0_-4px_24px_rgba(7,26,58,0.06)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 px-1 pt-1.5 pb-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] tracking-wide transition-colors",
                  active
                    ? "text-[#0b3d91]"
                    : "text-[#0b3d91]/55 hover:text-[#0b3d91]/85"
                )}
              >
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md transition-colors",
                    active && "bg-[#0b3d91]/08 text-[#0b3d91]"
                  )}
                >
                  <Icon
                    className="size-[1.15rem]"
                    strokeWidth={active ? 2.25 : 1.75}
                    aria-hidden
                  />
                </span>
                <span
                  className={cn(
                    "font-medium",
                    active ? "text-[#0b3d91]" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 h-0.5 w-4 rounded-full bg-[#c9a227] transition-opacity",
                    active ? "opacity-100" : "opacity-0"
                  )}
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
