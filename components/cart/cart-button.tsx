// components/cart/cart-button.tsx
"use client";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

export function CartButton({ plain = false }: { plain?: boolean }) {
  const { data } = useCart();
  const count = data?.items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0;

  if (plain) {
    return (
      <button
        type="button"
        aria-label="Cart"
        className="relative p-2 text-foreground/70 hover:text-purple-600"
      >
        <ShoppingBag className="h-5 w-5" />
        {count > 0 ? (
          <span className="absolute -right-0 -top-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-semibold text-white">
            {count}
          </span>
        ) : null}
      </button>
    );
  }

  return (
    <Button type="button" variant="outline" size="icon" aria-label="Cart">
      <div className="relative">
        <ShoppingBag className="h-5 w-5" />
        {count > 0 ? (
          <span className="absolute -right-0 -top-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-semibold text-white">
            {count}
          </span>
        ) : null}
      </div>
    </Button>
  );
}
