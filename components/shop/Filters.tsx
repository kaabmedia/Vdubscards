// components/shop/Filters.tsx
"use client";
import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Term = { id: number; name: string; slug: string };
type Attribute = { id: number; name: string; slug: string; terms: Term[] };

function isCappedAttribute(a: Attribute) {
  const n = a.name.toLowerCase();
  const s = a.slug.toLowerCase();
  return n.includes("collect") || n.includes("collectie") || s.includes("collect") || s.includes("collectie") || n.includes("year") || s.includes("year");
}

export function Filters({ price: _price, attributes }: { price?: { min: number; max: number }; attributes: Attribute[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [priceOpen, setPriceOpen] = React.useState(false);

  React.useEffect(() => {
    try {
      const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
      setOpen(isDesktop);
      setPriceOpen(isDesktop);
    } catch {}
  }, []);

  // Price ranges in steps of 100 up to 1000, and a final ">1000" option
  const ranges: { label: string; min: number; max: number | null; token: string }[] = [
    { label: "€0–100", min: 0, max: 100, token: "0-100" },
    { label: "€100–200", min: 100, max: 200, token: "100-200" },
    { label: "€200–300", min: 200, max: 300, token: "200-300" },
    { label: "€300–400", min: 300, max: 400, token: "300-400" },
    { label: "€400–500", min: 400, max: 500, token: "400-500" },
    { label: "€500–600", min: 500, max: 600, token: "500-600" },
    { label: "€600–700", min: 600, max: 700, token: "600-700" },
    { label: "€700–800", min: 700, max: 800, token: "700-800" },
    { label: "€800–900", min: 800, max: 900, token: "800-900" },
    { label: "€900–1000", min: 900, max: 1000, token: "900-1000" },
    // 1001+ to represent ">1000"
    { label: "> €1000", min: 1001, max: null, token: "1001+" },
  ];

  function updateQS(next: Record<string, string | null>) {
    const qs = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "") qs.delete(k);
      else qs.set(k, v);
    }
    // Reset pagination when filters change
    qs.delete("page");
    router.push(`${pathname}?${qs.toString()}`);
  }

  function togglePriceRange(token: string) {
    const current = new Set((sp.get("price_ranges") || "").split(",").filter(Boolean));
    if (current.has(token)) current.delete(token); else current.add(token);
    const joined = Array.from(current).join(",");
    const next: Record<string, string | null> = {
      price_ranges: joined || null,
      // Ensure legacy single-range params are cleared to avoid conflicts
      min_price: null,
      max_price: null,
    };
    updateQS(next);
  }

  function toggleAttr(slug: string, termId: number) {
    const key = `attr_${slug.replace(/^pa_/, "")}`;
    const cur = sp.get(key)?.split(",").filter(Boolean).map((s) => Number(s)) || [];
    const set = new Set(cur);
    if (set.has(termId)) set.delete(termId); else set.add(termId);
    const out = Array.from(set);
    updateQS({ [key]: out.length ? out.join(",") : null });
  }

  function clearAll() {
    const qs = new URLSearchParams(sp.toString());
    Array.from(qs.keys()).forEach((k) => {
      if (k === "search" || k === "q") return;
      if (k.startsWith("attr_") || k === "min_price" || k === "max_price" || k === "price_ranges") qs.delete(k);
    });
    router.push(`${pathname}?${qs.toString()}`);
  }

  const selectedTokens = new Set((sp.get("price_ranges") || "").split(",").filter(Boolean));
  // Back-compat: if only legacy min/max present and matches one of our discrete ranges, treat as selected
  const curMin = Number(sp.get("min_price") ?? "NaN");
  const curMax = sp.get("max_price") ? Number(sp.get("max_price")) : null;
  const legacyIndex = ranges.findIndex((r) => (r.max == null ? Number.isFinite(curMin) && curMin >= r.min && curMax == null : curMin === r.min && curMax === r.max));

  return (
    <aside className="border bg-card p-4 rounded-none">
      <div className="flex items-center justify-between">
        <div className="font-medium">Filters</div>
        <div className="flex items-center gap-3">
          <button onClick={clearAll} className="text-xs underline text-muted-foreground hover:text-foreground">Reset</button>
          <button
            type="button"
            className="md:hidden p-1.5 text-foreground/70 hover:text-foreground"
            aria-label="Toggle filters"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className={`${open ? "block" : "hidden"} md:block`}>
        {/* Price ranges */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Price</div>
            <button
              type="button"
              className="md:hidden p-1.5 text-foreground/70 hover:text-foreground"
              aria-label="Toggle price"
              aria-expanded={priceOpen}
              onClick={() => setPriceOpen((v) => !v)}
            >
              {priceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          <div className={`${priceOpen ? "grid" : "hidden"} md:grid mt-3 grid-cols-2 gap-2`}>
          {ranges.map((r, i) => {
            const active = selectedTokens.has(r.token) || (!selectedTokens.size && i === legacyIndex);
            return (
              <button
                key={r.token}
                onClick={() => togglePriceRange(r.token)}
                className={
                  `h-8 px-3 text-xs border rounded-none text-left ` +
                  (active ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")
                }
                aria-pressed={active}
              >
                {r.label}
              </button>
            );
          })}
          </div>
        </div>

        {/* Attributes */}
        <div className="mt-6 space-y-6">
        {attributes.map((a) => {
          if (!a.terms.length) return null;
          const key = `attr_${a.slug.replace(/^pa_/, "")}`;
          const selected = new Set((sp.get(key) || "").split(",").filter(Boolean).map((s) => Number(s)));
          return (
            <AttrFilter
              key={a.id}
              attr={a}
              selected={selected}
              onToggle={(termId) => toggleAttr(a.slug, termId)}
            />
          );
        })}
        </div>
      </div>
    </aside>
  );
}

function AttrFilter({ attr, selected, onToggle }: { attr: Attribute; selected: Set<number>; onToggle: (id: number) => void }) {
  const capped = isCappedAttribute(attr);
  const [showAll, setShowAll] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    try {
      const isDesktop = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches;
      setOpen(isDesktop);
    } catch {}
  }, []);
  const terms = capped && !showAll ? attr.terms.slice(0, 5) : attr.terms;
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{attr.name}</div>
        <button
          type="button"
          className="md:hidden p-1.5 text-foreground/70 hover:text-foreground"
          aria-label={`Toggle ${attr.name}`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>
      <div className={`${open ? "grid" : "hidden"} md:grid mt-2 grid-cols-2 gap-2`}>
        {terms.map((t) => (
          <label key={t.id} className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-3.5 w-3.5"
              checked={selected.has(t.id)}
              onChange={() => onToggle(t.id)}
            />
            <span>{t.name}</span>
          </label>
        ))}
      </div>
      {open && capped && attr.terms.length > 5 ? (
        <button
          onClick={() => setShowAll((s) => !s)}
          aria-expanded={showAll}
          className="mt-2 w-full relative inline-flex items-center justify-between text-xs px-3 py-2 border rounded-none text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span>{showAll ? "Less" : "More"}</span>
          {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      ) : null}
    </div>
  );
}
