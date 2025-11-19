// app/cart/page.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { formatEUR } from "@/lib/currency";
import { ProductCard } from "@/components/product/product-card";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  price?: string;
  images?: { src: string; alt?: string }[];
};

export default function CartPage() {
  const { data, addToCart, removeFromCart, clearCart } = useCart();
  const items = data?.items ?? [];
  const [details, setDetails] = React.useState<Record<number, Product>>({});
  const [upsell, setUpsell] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!items.length) {
      setDetails({});
      return;
    }
    const ids = Array.from(new Set(items.map((i) => i.productId)));
    (async () => {
      try {
        const res = await fetch(`/api/products/bulk?ids=${ids.join(",")}`, { cache: "no-store" });
        if (!res.ok) return;
        const list = (await res.json()) as Product[];
        const map: Record<number, Product> = {} as any;
        for (const p of list) map[(p as any).id] = p;
        setDetails(map);
      } catch {}
    })();
  }, [items]);

  // Server-powered upsell based on cart items (reduced client work)
  React.useEffect(() => {
    if (!items.length) {
      setUpsell([]);
      return;
    }
    const ids = Array.from(new Set(items.map((i) => i.productId)));
    (async () => {
      try {
        const r = await fetch(`/api/upsell?ids=${ids.join(",")}&limit=4`, { cache: "no-store" });
        if (!r.ok) {
          setUpsell([]);
          return;
        }
        const list = (await r.json()) as any[];
        setUpsell(Array.isArray(list) ? list : []);
      } catch {
        setUpsell([]);
      }
    })();
  }, [items]);

  const subtotal = React.useMemo(() => {
    return items.reduce((acc, i) => {
      const p = details[i.productId];
      const price = p ? Number(p.price ?? 0) : 0;
      return acc + price * i.quantity;
    }, 0);
  }, [items, details]);

  return (
    <div className="pb-0">
      {/* Cart section (full-bleed with equal padding and borders) */}
      <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] bg-white border-t border-b">
        <div className="container py-8 md:py-12">
          <div className="flex items-end justify-between">
            <h1>Cart</h1>
            {items.length ? (
              <button onClick={() => clearCart()} className="text-sm text-muted-foreground hover:text-foreground underline">
                Clear cart
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-4">
              Your cart is empty. <Link className="underline" href="/products">Continue shopping</Link>.
            </p>
          ) : (
            <div className="grid gap-8 md:grid-cols-3 mt-6">
              {/* Items */}
              <div className="md:col-span-2 space-y-4">
                {items.map((i) => {
                  const p = details[i.productId];
                  const img = p?.images?.[0]?.src;
                  const price = p?.price ? Number(p.price) : 0;
                  return (
                    <div key={`${i.productId}`} className="flex items-center gap-3 border p-3 bg-card">
                      <div className="h-16 w-16 shrink-0 bg-muted overflow-hidden">
                        {img ? (
                          <Image src={img} alt={p?.name ?? ""} width={64} height={64} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{p?.name ?? `#${i.productId}`}</div>
                        <div className="text-xs text-muted-foreground">Price: {formatEUR(price)}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Decrease"
                            className="h-8 w-8 border text-sm rounded-none"
                            onClick={() => addToCart({ productId: i.productId, quantity: -1 })}
                          >
                            −
                          </button>
                          <span className="text-sm w-6 text-center">{i.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase"
                            className="h-8 w-8 border text-sm rounded-none"
                            onClick={() => addToCart({ productId: i.productId, quantity: 1 })}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="ml-2 text-xs text-muted-foreground hover:underline"
                            onClick={() => removeFromCart(i.productId)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-sm font-medium">{formatEUR(price * i.quantity)}</div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="space-y-3 border bg-card p-4 h-fit">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatEUR(subtotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Taxes and shipping are calculated at checkout.</p>
                <Link href="/checkout" className="inline-flex h-10 items-center justify-center w-full rounded-none bg-black text-white hover:bg-black/90 text-sm">Checkout</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Upsell section */}
      {upsell.length > 0 ? (
        <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] bg-muted border-t border-b">
          <div className="container py-8 md:py-12">
            <h2 className="mb-4">You may also like</h2>
            <div className="px-0 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {upsell.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
