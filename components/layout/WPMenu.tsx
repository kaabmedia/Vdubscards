// components/layout/WPMenu.tsx
"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { ChevronDown, ChevronRight, Heart, User } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";

type NavItem = {
  id: number;
  label: string;
  path: string;
  children?: NavItem[];
};

async function fetchPrimaryMenu(): Promise<NavItem[]> {
  const res = await fetch("/api/menu/primary", { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: NavItem[] };
  return data.items || [];
}

export function WPMenuDesktop({ initial }: { initial?: NavItem[] }) {
  const { data } = useQuery({
    queryKey: ["wp-menu-primary"],
    queryFn: fetchPrimaryMenu,
    staleTime: 5 * 60_000,
    initialData: initial,
  });
  const items = data || [];
  const [open, setOpen] = React.useState<Set<number>>(() => new Set());
  const toggle = (id: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm">
      {items.map((it) => (
        <div key={it.id} className="relative group">
          <Link href={it.path as any} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <span>{it.label}</span>
            {it.children && it.children.length ? (
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            ) : null}
          </Link>
          {it.children && it.children.length ? (
            <div className="absolute left-0 top-full z-40 hidden group-hover:block">
              <div className="mt-2 w-max rounded-none border bg-white px-1 py-2 shadow-soft">
                {it.children.map((c) => (
                  <div key={c.id} className="">
                    {c.children && c.children.length ? (
                      <button
                        type="button"
                        aria-label="Toon submenu"
                        aria-expanded={open.has(c.id)}
                        className="inline-flex items-center gap-10 rounded-none px-2.5 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:bg-muted whitespace-nowrap"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(c.id); }}
                      >
                        <span>{c.label}</span>
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    ) : (
                      <Link href={c.path as any} className="block rounded-none px-2.5 py-1.5 text-sm text-foreground/80 hover:text-foreground hover:bg-muted whitespace-nowrap">
                        {c.label}
                      </Link>
                    )}
                    {c.children && c.children.length ? (
                      <div className={`mb-1 ml-3 ${open.has(c.id) ? "block" : "hidden"}`}>
                        {c.children.map((g) => (
                          <Link
                            key={g.id}
                            href={g.path as any}
                            className="block rounded-none px-3 py-1 text-xs text-foreground/70 hover:text-foreground hover:bg-muted whitespace-nowrap transition-colors"
                          >
                            {g.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </nav>
  );
}

export function WPMenuMobile({ onNavigate, initial }: { onNavigate?: () => void; initial?: NavItem[] }) {
  const { data } = useQuery({
    queryKey: ["wp-menu-primary"],
    queryFn: fetchPrimaryMenu,
    staleTime: 5 * 60_000,
    initialData: initial,
  });
  const items = data || [];
  const [open, setOpen] = React.useState<Set<number>>(() => new Set());
  const toggle = (id: number) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const { count } = useWishlist();

  return (
    <div className="flex flex-col space-y-2">
      {/* Row: Favorites + Account side by side with clearer separation */}
      <div className="grid grid-cols-2 overflow-hidden rounded-none border border-black/10 divide-x divide-black/10 bg-white/90 place-items-center">
        {/* Favorites entry */}
        <div className="flex items-center">
          <Link
            href="/wishlist"
            className="flex-1 text-foreground rounded-none px-3 py-3 text-lg font-semibold inline-flex items-center justify-center gap-2 text-center"
            onClick={onNavigate}
          >
            <Heart className="h-5 w-5" />
            <span className="relative">
              Favorites
              {count > 0 ? (
                <span className="absolute -top-2 -right-3 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] font-semibold text-white">
                  {count}
                </span>
              ) : null}
            </span>
          </Link>
        </div>
        {/* Account entry */}
        <div className="flex items-center">
          <Link
            href="/account"
            className="flex-1 text-foreground rounded-none px-3 py-3 text-lg font-semibold inline-flex items-center justify-center gap-2 text-center"
            onClick={onNavigate}
          >
            <User className="h-5 w-5" />
            <span>Account</span>
          </Link>
        </div>
      </div>
      {items.map((it) => (
        <div key={it.id}>
          <div className="flex items-center">
            <Link
              href={it.path as any}
              className="flex-1 text-foreground rounded-none px-3 py-3 text-lg font-semibold"
              onClick={onNavigate}
            >
              {it.label}
            </Link>
            {it.children && it.children.length ? (
              <button
                type="button"
                aria-label="Toon submenu"
                aria-expanded={open.has(it.id)}
                className="p-2 text-foreground/70 hover:text-foreground"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(it.id); }}
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            ) : null}
          </div>
          {it.children && it.children.length ? (
            <div className={`mt-1 ml-2 flex flex-col space-y-2 ${open.has(it.id) ? "block" : "hidden"}`}>
              {it.children.map((c) => (
                <div key={c.id}>
                  {c.children && c.children.length ? (
                    <button
                      type="button"
                      aria-label="Toon submenu"
                      aria-expanded={open.has(c.id)}
                      className="inline-flex items-center gap-3 text-left text-base text-foreground/90 px-3 py-2.5 rounded-none"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(c.id); }}
                    >
                      <span>{c.label}</span>
                      <ChevronDown className="h-5 w-5" />
                    </button>
                  ) : (
                    <Link
                      href={c.path as any}
                      className="text-base text-foreground/90 px-3 py-2.5 rounded-none"
                      onClick={onNavigate}
                    >
                      {c.label}
                    </Link>
                  )}
                  {c.children && c.children.length ? (
                    <div className={`mt-1 ml-3 flex flex-col space-y-1.5 ${open.has(c.id) ? "block" : "hidden"}`}>
                      {c.children.map((g) => (
                        <Link
                          key={g.id}
                          href={g.path as any}
                          className="text-base text-foreground/80 hover:text-foreground px-3 py-2 rounded-none transition-colors"
                          onClick={onNavigate}
                        >
                          {g.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
