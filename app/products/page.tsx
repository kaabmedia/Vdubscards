// app/products/page.tsx
import { ProductCard } from "@/components/product/product-card";
import type { WCProduct } from "@/lib/types";
import { getBaseUrl } from "@/lib/server-url";
import { Filters } from "@/components/shop/Filters";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function buildQS(obj: any) {
  const qs = new URLSearchParams();
  if (!obj) return qs;
  try {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof k !== "string") continue;
      if (v == null) continue;
      if (Array.isArray(v)) {
        for (const val of v) if (val != null) qs.append(k, String(val));
      } else {
        qs.set(k, String(v));
      }
    }
  } catch {
    // Fallback: return empty on unexpected shapes
  }
  return qs;
}

async function getProducts(paramsAll: Record<string, string | null | undefined>) {
  const perPage = 24;
  const qs = new URLSearchParams();
  qs.set("per_page", String(perPage));
  for (const [k, v] of Object.entries(paramsAll)) {
    if (v == null) continue;
    if (
      k === "search" ||
      k === "on_sale" ||
      k === "category" ||
      k === "page" ||
      k === "min_price" ||
      k === "max_price" ||
      k === "price_ranges" ||
      k.startsWith("attr_")
    ) {
      qs.set(k, v);
    }
  }

  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/products?${qs.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return { items: [] as WCProduct[], totalPages: 1 };
    const totalPages = Number(res.headers.get("x-wp-totalpages") || res.headers.get("x-total-pages") || "0") || 1;
    const items = (await res.json()) as WCProduct[];

    return { items, totalPages };
  } catch {
    return { items: [] as WCProduct[], totalPages: 1 };
  }
}

async function getFilters() {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/filters`, { next: { revalidate: 300 } });
    if (!res.ok) return { price: { min: 0, max: 0 }, attributes: [] } as any;
    return (await res.json()) as { price: { min: number; max: number }; attributes: any[] };
  } catch {
    return { price: { min: 0, max: 0 }, attributes: [] } as any;
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const searchParamsResolved = await searchParams;
  const page = Math.max(1, Number((searchParamsResolved && searchParamsResolved.page) || "1"));
  const { items: products, totalPages } = await getProducts(searchParamsResolved || {});
  const { price, attributes } = await getFilters();
  const search = (searchParamsResolved && searchParamsResolved.search) || null;
  const category = (searchParamsResolved && searchParamsResolved.category) || null;

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-end justify-between">
        <div>
          <h1>Products</h1>
          {search ? (
            <p className="text-sm text-muted-foreground">Results for “{search}”</p>
          ) : null}
          {category ? (
            <p className="text-sm text-muted-foreground">Filtered by category: {category}</p>
          ) : null}
        </div>
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-1">
          <Filters price={price} attributes={attributes} />
        </div>
        <div className="lg:col-span-4 px-0 pb-5">
          {products?.length ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No products found.</p>
          )}
          <div className="mt-6 flex items-center justify-between">
            {(() => {
              const spPrev = buildQS(searchParamsResolved);
              const prevPage = Math.max(1, page - 1);
              spPrev.set("page", String(prevPage));
              const spNext = buildQS(searchParamsResolved);
              const nextPage = page + 1;
              spNext.set("page", String(nextPage));
              const hasPrev = page > 1;
              const hasNext = page < (totalPages || 1);
              return (
                <>
                  <Link
                    href={`/products?${spPrev.toString()}`}
                    aria-disabled={!hasPrev}
                    className={`h-10 inline-flex items-center gap-2 px-4 border rounded-none text-sm bg-card shadow-soft ${hasPrev ? "hover:bg-muted" : "opacity-50 pointer-events-none"}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>
                  <div className="text-xs text-muted-foreground">Page {page}{totalPages ? ` of ${totalPages}` : ""}</div>
                  <Link
                    href={`/products?${spNext.toString()}`}
                    aria-disabled={!hasNext}
                    className={`h-10 inline-flex items-center gap-2 px-4 border rounded-none text-sm bg-card shadow-soft ${hasNext ? "hover:bg-muted" : "opacity-50 pointer-events-none"}`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
