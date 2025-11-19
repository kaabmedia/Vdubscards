// components/wishlist/wishlist-toggle.tsx
"use client";
import { WishlistButton } from "@/components/wishlist/wishlist-button";

export function WishlistToggle({ id }: { id: number }) {
  return <WishlistButton id={id} />;
}

