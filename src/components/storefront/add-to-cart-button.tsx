"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/components/storefront/cart-provider";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  bookId,
  disabled = false,
  label = "Add to cart",
}: {
  bookId: string;
  disabled?: boolean;
  label?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={disabled || pending}
      onClick={() => {
        startTransition(() => {
          addItem(bookId, 1);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1800);
        });
      }}
      className="min-w-[8rem]"
    >
      {added ? "Added" : label}
    </Button>
  );
}
