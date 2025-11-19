// hooks/use-wishlist.tsx
"use client";
import * as React from "react";

type WishlistContextValue = {
  ids: number[];
  count: number;
  has: (id: number) => boolean;
  add: (id: number) => void;
  remove: (id: number) => void;
  toggle: (id: number) => void;
  clear: () => void;
};

const WishlistContext = React.createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "vdubs_wishlist";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = React.useState<number[]>([]);
  const pruneTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load from localStorage
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as number[];
        if (Array.isArray(arr)) setIds([...new Set(arr.map((n) => Number(n)))].filter((n) => Number.isFinite(n)));
      }
    } catch {}
  }, []);

  // Persist to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {}
  }, [ids]);

  // Prune out-of-stock products automatically (initially and after changes, debounced)
  React.useEffect(() => {
    if (!ids.length) return;
    if (pruneTimer.current) clearTimeout(pruneTimer.current);
    pruneTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/bulk?ids=${ids.join(",")}`, { cache: "no-store" });
        if (!res.ok) return;
        const list = (await res.json()) as any[];
        const inStock = new Set<number>();
        for (const p of list) {
          const qty = typeof p?.stock_quantity === "number" ? p.stock_quantity : undefined;
          const status = String(p?.stock_status || "").toLowerCase();
          const available = (status ? status === "instock" : true) && (typeof qty === "number" ? qty > 0 : true);
          if (available) inStock.add(Number(p?.id));
        }
        const newIds = ids.filter((id) => inStock.has(id));
        const same = newIds.length === ids.length && newIds.every((v, i) => v === ids[i]);
        if (!same) setIds(newIds);
      } catch {}
    }, 400);
    return () => {
      if (pruneTimer.current) clearTimeout(pruneTimer.current);
      pruneTimer.current = null;
    };
  }, [ids]);

  const value = React.useMemo<WishlistContextValue>(() => {
    const has = (id: number) => ids.includes(id);
    const add = (id: number) => setIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    const remove = (id: number) => setIds((prev) => prev.filter((x) => x !== id));
    const toggle = (id: number) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    const clear = () => setIds([]);
    return { ids, count: ids.length, has, add, remove, toggle, clear };
  }, [ids]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
