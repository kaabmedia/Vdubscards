// components/wishlist/wishlist-button.tsx
"use client";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import * as React from "react";

export function WishlistButton({ id, className }: { id: number; className?: string }) {
  const { has, toggle } = useWishlist();
  const active = has(id);
  const [pop, setPop] = React.useState(false);
  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const willActivate = !active;
        toggle(id);
        if (willActivate) {
          setPop(false);
          // restart animation
          requestAnimationFrame(() => {
            setPop(true);
            setTimeout(() => setPop(false), 500);
          });
        }
      }}
      className={
        className ||
        "p-1.5 md:p-2 bg-white rounded-full text-foreground/70 hover:text-foreground shadow-soft"
      }
    >
      <Heart className={`h-5 w-5 ${active ? "fill-current text-red-500" : ""} ${pop ? "anim-wish-pop" : ""}`} />
    </button>
  );
}
