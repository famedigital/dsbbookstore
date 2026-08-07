"use client";

import { useEffect } from "react";
import { useCart } from "@/components/storefront/cart-provider";

/** Clears the cart cookie after a successful checkout. */
export function ClearCartOnMount() {
  const { clear, ready } = useCart();
  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);
  return null;
}
