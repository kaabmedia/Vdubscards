// hooks/use-cart.ts
"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type CartItem = { productId: number; quantity: number };
type Cart = { items: CartItem[] };

async function getCart(): Promise<Cart> {
  const res = await fetch("/api/cart", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load cart");
  return res.json();
}

async function addToCart(input: CartItem): Promise<Cart> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    let detail: any = undefined;
    try { detail = await res.json(); } catch {}
    throw new Error(detail?.error || "Failed to add to cart");
  }
  return res.json();
}

async function clearCart(): Promise<Cart> {
  const res = await fetch("/api/cart", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to clear cart");
  return res.json();
}

async function removeFromCart(productId: number): Promise<Cart> {
  const res = await fetch(`/api/cart?productId=${productId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to remove item");
  return res.json();
}

export function useCart() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const add = useMutation({
    mutationFn: addToCart,
    onSuccess: (data) => {
      qc.setQueryData(["cart"], data);
    },
  });

  const clear = useMutation({
    mutationFn: clearCart,
    onSuccess: (data) => {
      qc.setQueryData(["cart"], data);
    },
  });

  const remove = useMutation({
    mutationFn: removeFromCart,
    onSuccess: (data) => {
      qc.setQueryData(["cart"], data);
    },
  });

  return {
    ...query,
    addToCart: add.mutateAsync,
    clearCart: clear.mutateAsync,
    removeFromCart: remove.mutateAsync,
  };
}
