// app/wishlist/page.tsx
"use client";
import * as React from "react";
import { useWishlist } from "@/hooks/use-wishlist";
import { ProductCard } from "@/components/product/product-card";

export default function WishlistPage() {
  const { ids, clear } = useWishlist();
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!ids.length) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await Promise.all(
          ids.map((id) => fetch(`/api/products/${id}`, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)))
        );
        const list = res.filter(Boolean);
        // Only display in-stock items; provider handles pruning state-wise
        const keep = list.filter((p: any) => {
          const qty = typeof p?.stock_quantity === "number" ? p.stock_quantity : undefined;
          const status = String(p?.stock_status || "").toLowerCase();
          return (status ? status === "instock" : true) && (typeof qty === "number" ? qty > 0 : true);
        });
        if (!cancelled) setItems(keep);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-end justify-between">
        <h1>Wishlist</h1>
        {ids.length ? (
          <button onClick={clear} className="text-sm text-muted-foreground hover:text-foreground underline">
            Clear
          </button>
        ) : null}
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : ids.length === 0 ? (
        <p className="text-sm text-muted-foreground">Your wishlist is empty.</p>
      ) : (
        <div className="px-0 pb-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
