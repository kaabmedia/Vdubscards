// components/wishlist/wishlist-control.tsx
"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";

export function WishlistControl() {
  const { count } = useWishlist();
  return (
    <Link
      href="/wishlist"
      className="relative inline-flex items-center p-2 text-foreground/70 hover:text-purple-600"
      aria-label="Wishlist"
    >
      <Heart className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-0 -top-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
