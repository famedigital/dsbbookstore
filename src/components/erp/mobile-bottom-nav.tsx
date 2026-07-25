"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  erpBottomNav,
  erpMoreTab,
  isNavActive,
} from "@/components/erp/nav";
import { cn } from "@/lib/utils";

type Props = {
  onMore: () => void;
};

export function MobileBottomNav({ onMore }: Props) {
  const pathname = usePathname();
  const MoreIcon = erpMoreTab.icon;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-card/95 pb-safe backdrop-blur md:hidden"
      aria-label="ERP primary"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 items-stretch">
        {erpBottomNav.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          const isPos = item.href === "/erp/pos";
          return (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium tracking-wide transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                  isPos && !active && "text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg",
                    isPos &&
                      "bg-primary text-primary-foreground shadow-sm",
                    isPos && active && "bg-primary",
                    !isPos && active && "bg-primary/10"
                  )}
                >
                  <Icon
                    className={cn("size-5", isPos && "size-[1.15rem]")}
                  />
                </span>
                <span className={cn(active && "text-primary")}>
                  {item.shortTitle ?? item.title}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="flex">
          <button
            type="button"
            onClick={onMore}
            className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="flex size-9 items-center justify-center rounded-lg">
              <MoreIcon className="size-5" />
            </span>
            <span>{erpMoreTab.shortTitle}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
