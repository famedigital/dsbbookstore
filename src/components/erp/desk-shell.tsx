"use client";

import { usePathname } from "next/navigation";

export function ErpDeskShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const onCounter =
    pathname === "/erp/counter" || pathname.startsWith("/erp/counter/");

  return (
    <div
      className="flex min-h-dvh flex-col bg-background lg:flex-row"
      data-desk={onCounter ? "counter" : "office"}
    >
      {children}
    </div>
  );
}
