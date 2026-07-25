"use client";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button size="sm" type="button" onClick={() => window.print()}>
      Print receipt
    </Button>
  );
}
