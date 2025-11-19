// components/cart/add-to-cart-button.tsx
"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

type Props = {
  productId: number;
  className?: string;
};

export function AddToCartButton({ productId, className }: Props) {
  const { addToCart, data, removeFromCart } = useCart();
  const [loading, setLoading] = React.useState(false);
  const [added, setAdded] = React.useState(false);
  const inCart = (data?.items ?? []).some((i) => i.productId === productId);

  async function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      if (inCart) {
        await removeFromCart(productId);
      } else {
        await addToCart({ productId, quantity: 1 });
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={onClick}
      className={cn("rounded-none bg-black text-white hover:bg-black/90", className)}
      disabled={loading}
    >
      {inCart ? (loading ? "Removing…" : "Remove from Cart") : added ? "Added" : loading ? "Adding…" : "Add to Cart"}
    </Button>
  );
}
