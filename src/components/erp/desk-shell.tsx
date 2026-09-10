"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ErpDeskShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onCounter =
    pathname === "/erp/counter" || pathname.startsWith("/erp/counter/");

  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col bg-background",
        // Office keeps left sidebar; Counter must stay stacked (top bar + till).
        !onCounter && "lg:flex-row"
      )}
      data-desk={onCounter ? "counter" : "office"}
    >
      {children}
    </div>
  );
}
