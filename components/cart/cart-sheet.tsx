// components/cart/cart-sheet.tsx
"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatEUR } from "@/lib/currency";

type Props = {
  trigger?: React.ReactNode;
};

type Product = {
  id: number;
  name: string;
  price?: string;
  images?: { src: string; alt?: string }[];
};

export function CartSheet({ trigger }: Props) {
  const { data, clearCart, addToCart, removeFromCart } = useCart();
  const [open, setOpen] = React.useState(false);
  const [details, setDetails] = React.useState<Record<number, Product>>({});
  const items = data?.items ?? [];

  React.useEffect(() => {
    if (!open || !items.length) return;
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
  }, [open, items, details]);

  const subtotal = React.useMemo(() => {
    return items.reduce((acc, i) => {
      const p = details[i.productId];
      const price = p ? Number(p.price ?? 0) : 0;
      return acc + price * i.quantity;
    }, 0);
  }, [items, details]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <span role="button" onClick={() => setOpen(true)} className="contents">
          {trigger ?? <button type="button" className="p-2">Cart</button>}
        </span>
      </SheetTrigger>
      <SheetContent side="right" className="w-96 max-w-full">
        <div className="flex items-center justify-between">
          <SheetTitle>Cart</SheetTitle>
          {items.length ? (
            <Button variant="outline" onClick={() => clearCart()}>
              Clear
            </Button>
          ) : null}
        </div>
        <div className="mt-6 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          ) : (
            items.map((i) => {
              const p = details[i.productId];
              const img = p?.images?.[0]?.src;
              return (
                <div key={`${i.productId}`} className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 bg-muted overflow-hidden">
                    {img ? (
                      <Image
                        src={img}
                        alt={p?.name ?? ""}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{p?.name ?? `#${i.productId}`}</div>
                    <div className="mt-1 flex items-center gap-2">
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
                  <div className="text-sm">
                    {p?.price ? formatEUR(Number(p.price) * i.quantity) : "—"}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="mt-6 border-t pt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Subtotal</div>
          <div className="text-sm font-medium">{formatEUR(subtotal)}</div>
        </div>
        <div className="mt-4 flex gap-2">
          <SheetClose asChild>
            <Link href="/cart" className="flex-1">
              <Button variant="outline" className="w-full rounded-none">Bekijk winkelwagen</Button>
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/checkout" className="flex-1">
              <Button className="w-full rounded-none bg-black text-white hover:bg-black/90">Checkout</Button>
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
