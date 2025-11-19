// components/checkout/checkout-summary.tsx
"use client";
import * as React from "react";
import { useCart } from "@/hooks/use-cart";
import { formatEUR } from "@/lib/currency";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  price?: string;
  images?: { src: string; alt?: string }[];
};

export function CheckoutSummary() {
  const { data } = useCart();
  const items = data?.items ?? [];
  const [details, setDetails] = React.useState<Record<number, Product>>({});

  React.useEffect(() => {
    if (!items.length) return;
    const controller = new AbortController();
    (async () => {
      const fetchOne = async (id: number) => {
        try {
          const res = await fetch(`/api/products/${id}`, { signal: controller.signal });
          if (!res.ok) return;
          const p = (await res.json()) as Product;
          setDetails((prev) => ({ ...prev, [id]: p }));
        } catch {}
      };
      await Promise.all(items.map((i) => (details[i.productId] ? Promise.resolve() : fetchOne(i.productId))));
    })();
    return () => controller.abort();
  }, [items, details]);

  const subtotal = React.useMemo(() => {
    return items.reduce((acc, i) => {
      const p = details[i.productId];
      const price = p ? Number(p.price ?? 0) : 0;
      return acc + price * i.quantity;
    }, 0);
  }, [items, details]);

  const vatRate = Number(process.env.NEXT_PUBLIC_VAT_RATE || 21);
  const shippingFlat = Number(process.env.NEXT_PUBLIC_SHIPPING_FLAT || 0);

  const vat = Math.max(Math.round((subtotal * vatRate) / 100), 0);
  const total = subtotal + shippingFlat + vat;

  return (
    <div className="rounded-none border bg-card p-6">
      <h2>Je bestelling</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Je winkelwagentje is leeg.</p>
        ) : (
          items.map((i) => {
            const p = details[i.productId];
            const img = p?.images?.[0]?.src;
            const price = p?.price ? Number(p.price) : 0;
            return (
              <div key={`${i.productId}`} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 bg-muted overflow-hidden">
                  {img ? (
                    <Image
                      src={img}
                      alt={p?.name ?? ""}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                      sizes="48px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{p?.name ?? `#${i.productId}`}</div>
                  <div className="text-xs text-muted-foreground">Aantal: {i.quantity}</div>
                </div>
                <div className="text-sm">{formatEUR(price * i.quantity)}</div>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotaal</span>
          <span className="font-medium">{formatEUR(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Verzending</span>
          <span className="font-medium">{shippingFlat > 0 ? formatEUR(shippingFlat) : "Wordt berekend"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">BTW ({vatRate}%)</span>
          <span className="font-medium">{formatEUR(vat)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span>Totaal</span>
          <span className="font-semibold">{formatEUR(total)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Indicatief; exacte BTW en verzendkosten worden definitief bij afrekenen berekend.</p>
      </div>
    </div>
  );
}
