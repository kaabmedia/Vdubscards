// app/collections/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { wpGraphQL } from "@/lib/wp-graphql";
import { ProductCard } from "@/components/product/product-card";
import type { WCProduct } from "@/lib/types";
import { getBaseUrl } from "@/lib/server-url";
import Image from "next/image";
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
    // ignore
  }
  return qs;
}

type WPCollection = {
  collecties: {
    nodes: Array<{
      id: string;
      title: string;
      slug: string;
      featuredImage?: { node?: { sourceUrl?: string | null } | null } | null;
      content?: string | null;
    }>;
  };
};

const COLLECTION_BY_SLUG = /* GraphQL */ `
  query CollectionBySlug($slug: String!) {
    collecties(where: { name: $slug, status: PUBLISH }) {
      nodes {
        id
        title
        slug
        content
        featuredImage { node { sourceUrl } }
      }
    }
  }
`;

async function getCollection(slug: string) {
  const data = await wpGraphQL<WPCollection>(COLLECTION_BY_SLUG, { slug });
  const node = data?.collecties?.nodes?.[0];
  if (!node) return null;
  return {
    id: node.id,
    title: node.title,
    slug: node.slug,
    image: node.featuredImage?.node?.sourceUrl || null,
    content: node.content || null,
  };
}

async function getProductsForCollection(slug: string, paramsAll: Record<string, string | null | undefined>): Promise<{ items: WCProduct[]; totalPages: number }> {
  try {
    const base = await getBaseUrl();
    const qs = new URLSearchParams();
    qs.set("per_page", "24");
    for (const [k, v] of Object.entries(paramsAll || {})) {
      if (v == null) continue;
      if (k === "page") {
        qs.set(k, String(v));
        continue;
      }
      if (k === "min_price" || k === "max_price" || k === "price_ranges") {
        qs.set(k, String(v));
        continue;
      }
      if (k.startsWith("attr_")) {
        const rest = k.slice(5).toLowerCase();
        // Skip collection filter on collection pages
        if (rest.includes("collect")) continue;
        qs.set(k, String(v));
      }
    }
    const url = `${base}/api/collections/${encodeURIComponent(slug)}/products${qs.toString() ? `?${qs.toString()}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { items: [], totalPages: 1 };
    const totalPages = Number(res.headers.get("x-wp-totalpages") || res.headers.get("x-total-pages") || "0") || 1;
    const items = (await res.json()) as WCProduct[];
    return { items, totalPages };
  } catch {
    return { items: [], totalPages: 1 };
  }
}

function norm(s: string) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function getAttributeCatalog() {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/filters`, { next: { revalidate: 300 } });
    if (!res.ok) return [] as any[];
    const data = (await res.json()) as { attributes: any[] };
    return Array.isArray(data.attributes) ? data.attributes : [];
  } catch {
    return [] as any[];
  }
}

export async function generateStaticParams() {
  // Pre-generate a reasonable set; new ones render dynamically at runtime
  const QUERY = /* GraphQL */ `
    query AllCollections($first: Int!) {
      collecties(first: $first, where: { status: PUBLISH }) {
        nodes { slug }
      }
    }
  `;
  try {
    const data = await wpGraphQL<{ collecties: { nodes: { slug: string }[] } }>(QUERY, { first: 50 });
    return (data?.collecties?.nodes || []).map((n) => ({ slug: n.slug }));
  } catch {
    return [] as { slug: string }[];
  }
}

export const dynamicParams = true;
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const col = await getCollection(slug);
  if (!col) return { title: "Collectie" };
  return { title: `${col.title} — Collectie` };
}

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const col = await getCollection(slug);
  if (!col) return notFound();

  const page = Math.max(1, Number((searchParamsResolved && searchParamsResolved.page) || "1"));
  const [{ items: products, totalPages }, attrCatalog] = await Promise.all([
    getProductsForCollection(col.slug, searchParamsResolved || {}),
    getAttributeCatalog(),
  ]);

  // Derive relevant filters from visible products (collection-relevant without extra scans)
  const usedMap = new Map<string, Set<string>>();
  for (const p of products as any[]) {
    const attrs = Array.isArray((p as any)?.attributes) ? (p as any).attributes : [];
    for (const a of attrs) {
      const key = norm(String(a?.slug || a?.name || "")).replace(/^pa_/, "");
      if (!key) continue;
      const set = usedMap.get(key) || new Set<string>();
      const options: string[] = Array.isArray(a?.options)
        ? a.options.map((o: any) => String(o))
        : a?.option
        ? [String(a.option)]
        : [];
      for (const opt of options) set.add(norm(opt));
      usedMap.set(key, set);
    }
  }
  const filteredAttrs = (attrCatalog || [])
    .filter((a: any) => {
      const key = norm(String(a?.slug || a?.name || "")).replace(/^pa_/, "");
      if (!key) return false;
      // hide collection attribute on collection page
      if (key.includes("collect")) return false;
      return usedMap.has(key);
    })
    .map((a: any) => {
      const key = norm(String(a?.slug || a?.name || "")).replace(/^pa_/, "");
      const used = usedMap.get(key) || new Set<string>();
      const terms = Array.isArray(a?.terms)
        ? a.terms.filter((t: any) => used.has(norm(t?.name || "")))
        : [];
      return { id: a.id, name: a.name, slug: a.slug, terms };
    })
    .filter((a: any) => a.terms.length > 0);

  const priceMin = products.reduce((acc, p: any) => {
    const n = Number(p?.price || p?.sale_price || p?.regular_price || 0) || 0;
    return acc === 0 ? n : Math.min(acc, n);
  }, 0);
  const priceMax = products.reduce((acc, p: any) => {
    const n = Number(p?.price || p?.sale_price || p?.regular_price || 0) || 0;
    return acc === 0 ? n : Math.max(acc, n);
  }, 0);
  const filters = { price: { min: priceMin, max: priceMax }, attributes: filteredAttrs } as any;

  return (
    <div className="pb-16">
      {col.image ? (
        <div className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen">
          <div className="grid lg:grid-cols-2 items-stretch gap-0">
            <div className="relative overflow-hidden bg-muted aspect-[4/3] lg:aspect-[16/9] min-h-[220px]">
              <Image
                src={col.image}
                alt={col.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center space-y-3 px-6 py-6 lg:px-10 bg-[#fff7d1] text-black">
              <h1>{col.title}</h1>
              {col.content ? (
                <div
                  className="prose prose-sm prose-neutral max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: col.content }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Collection overview</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <h1>{col.title}</h1>
          {col.content ? (
            <div className="prose prose-sm prose-neutral max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: col.content }} />
          ) : (
            <p className="text-sm text-muted-foreground">Collectie overzicht</p>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-6 mt-16">
        <div className="lg:col-span-1">
          {(() => {
            const attrs = Array.isArray(filters.attributes) ? filters.attributes : [];
            const filtered = attrs.filter((a: any) => {
              const n = String(a?.name || "").toLowerCase();
              const s = String(a?.slug || "").toLowerCase();
              return !(n.includes("collect") || n.includes("collectie") || s.includes("collect") || s.includes("collectie"));
            });
            return <Filters price={filters.price} attributes={filtered} />;
          })()}
        </div>
        <div className="lg:col-span-4 px-0 pb-5">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No products found for this collection.</p>
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
                    href={`/collections/${encodeURIComponent(col.slug)}?${spPrev.toString()}`}
                    aria-disabled={!hasPrev}
                    className={`h-10 inline-flex items-center gap-2 px-4 border rounded-none text-sm bg-card shadow-soft ${hasPrev ? "hover:bg-muted" : "opacity-50 pointer-events-none"}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>
                  <div className="text-xs text-muted-foreground">Page {page}{totalPages ? ` of ${totalPages}` : ""}</div>
                  <Link
                    href={`/collections/${encodeURIComponent(col.slug)}?${spNext.toString()}`}
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
