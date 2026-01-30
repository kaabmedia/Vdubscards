// app/api/collections/[slug]/products/route.ts
import { NextResponse } from "next/server";
import { wpGraphQL } from "@/lib/wp-graphql";
import { wcFetch, wcFetchRaw } from "@/lib/woocommerce";
import { wooFetch, wooFetchRaw } from "@/lib/wooClient";

export const runtime = "nodejs";
export const revalidate = 300;

type WPCollectionBySlug = {
  collecties: { nodes: Array<{ title: string; slug: string }> };
};

const GQL_BY_SLUG = /* GraphQL */ `
  query CollectionBySlug($slug: String!) {
    collecties(where: { name: $slug, status: PUBLISH }) {
      nodes { title slug }
    }
  }
`;

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenSet(str: string) {
  return new Set(
    normalize(str)
      .split(/\s+/)
      .filter((t) => t.length >= 3)
  );
}

function approxMatch(a: string, b: string) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const ta = tokenSet(a);
  const tb = tokenSet(b);
  if (!ta.size || !tb.size) return false;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  const ratio = inter / Math.min(ta.size, tb.size);
  return ratio >= 0.6; // 60% token overlap
}

function productMatchesCollection(p: any, collectionTitle: string) {
  const attrs: any[] = Array.isArray(p?.attributes) ? p.attributes : [];
  // Common attribute names/slugs for collection
  const candNames = new Set([
    "collection",
    "collectie",
    "pa_collection",
    "pa_collectie",
  ]);

  for (const a of attrs) {
    const name = String(a?.name || a?.slug || "").toLowerCase();
    if (!name) continue;
    if ([...candNames].some((n) => name.includes(n))) {
      const options: string[] = Array.isArray(a?.options)
        ? a.options.map((o: any) => String(o))
        : a?.option
        ? [String(a.option)]
        : [];
      for (const opt of options) {
        if (approxMatch(opt, collectionTitle)) return true;
      }
    }
  }

  // Fallback: check meta_data fields for a likely collection value
  const meta: any[] = Array.isArray(p?.meta_data) ? p.meta_data : [];
  for (const m of meta) {
    const key = String(m?.key || "").toLowerCase();
    const val = String(m?.value || "");
    if (!key || !val) continue;
    if ([...candNames].some((n) => key.includes(n))) {
      if (approxMatch(val, collectionTitle)) return true;
    }
  }

  return false;
}

export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const per_page = Number(searchParams.get("per_page") || "24");
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const min_price = searchParams.get("min_price") || undefined;
    const max_price = searchParams.get("max_price") || undefined;
    const price_ranges = searchParams.get("price_ranges") || undefined;

    // Collect attribute filters: attr_<slug>=commaSeparatedTermIds
    const attrFilters: Array<{ slug: string; terms: string }> = [];
    searchParams.forEach((value, key) => {
      if (key.startsWith("attr_")) {
        const slug = key.substring(5);
        if (value) attrFilters.push({ slug, terms: value });
      }
    });

    // 1) Resolve collection title via GraphQL
    const data = await wpGraphQL<WPCollectionBySlug>(GQL_BY_SLUG, { slug });
    const node = data?.collecties?.nodes?.[0];
    if (!node) return NextResponse.json({ products: [] }, { status: 200 });
    const title = node.title;

    // 2) Query WooCommerce products
    // Fast path: if a 'collectie' attribute exists in Woo, query directly by term ID.
    const useBasic = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);

    try {
      const attrs = useBasic
        ? await wooFetch<any[]>(`/wp-json/wc/v3/products/attributes?per_page=100`)
        : await wcFetch<any[]>(`products/attributes`, { per_page: 100 } as any);
      const collAttr = (attrs || []).find((a: any) => {
        const n = String(a?.name || "").toLowerCase();
        const s = String(a?.slug || "").toLowerCase();
        return n.includes("collect") || n.includes("collectie") || s.includes("collect") || s.includes("collectie");
      });
      if (collAttr) {
        const terms = useBasic
          ? await wooFetch<any[]>(`/wp-json/wc/v3/products/attributes/${collAttr.id}/terms?per_page=100`)
          : await wcFetch<any[]>(`products/attributes/${collAttr.id}/terms`, { per_page: 100 } as any);
        const match = (terms || []).find((t: any) => approxMatch(String(t?.name || ""), title));
        if (match) {
          const qs = new URLSearchParams();
          qs.set("per_page", String(per_page));
          qs.set("page", String(page));
          if (min_price) qs.set("min_price", String(min_price));
          if (max_price) qs.set("max_price", String(max_price));
          // Primary collection attribute
          const tax = String(collAttr.slug || "pa_collectie");
          qs.append("attribute", tax);
          qs.append("attribute_term", String(match.id));
          // Additional attribute filters from query
          for (const f of attrFilters) {
            const tax2 = f.slug.startsWith("pa_") ? f.slug : `pa_${f.slug}`;
            qs.append("attribute", tax2);
            qs.append("attribute_term", f.terms);
          }
          const path = `/wp-json/wc/v3/products?${qs.toString()}`;
          const res = useBasic ? await wooFetchRaw(path) : await wcFetchRaw("products", Object.fromEntries(qs));
          if (res.ok) {
            const body = await res.json();
            const headers = new Headers();
            const total = res.headers.get("x-wp-total") || "0";
            const totalPages = res.headers.get("x-wp-totalpages") || "0";
            headers.set("x-wp-total", total);
            headers.set("x-wp-totalpages", totalPages);
            headers.set("cache-control", "no-store");
            return new NextResponse(JSON.stringify(body), { status: 200, headers });
          }
        }
      }
    } catch {
      // ignore fast-path errors; fall back to scan
    }

    const buildBasicQS = (overrides?: { min_price?: string; max_price?: string }) => {
      const qs = new URLSearchParams();
      if (overrides?.min_price) qs.set("min_price", overrides.min_price);
      if (overrides?.max_price) qs.set("max_price", overrides.max_price);
      for (const f of attrFilters) {
        const tax = f.slug.startsWith("pa_") ? f.slug : `pa_${f.slug}`;
        qs.append("attribute", tax);
        qs.append("attribute_term", f.terms);
      }
      const s = qs.toString();
      return s ? `&${s}` : "";
    };

    const buildParams = (overrides?: { min_price?: string; max_price?: string }) => {
      const p: any = {};
      if (overrides?.min_price) p.min_price = overrides.min_price;
      if (overrides?.max_price) p.max_price = overrides.max_price;
      if (attrFilters.length) {
        const first = attrFilters[0];
        const tax = first.slug.startsWith("pa_") ? first.slug : `pa_${first.slug}`;
        p.attribute = tax;
        p.attribute_term = first.terms;
      }
      return p;
    };

    const fetchSearchPage = async (page: number, per = 50, overrides?: { min_price?: string; max_price?: string }) => {
      const extraQS = buildBasicQS(overrides);
      const params: any = { per_page: per, page, search: title, ...buildParams(overrides) };
      return useBasic
        ? await wooFetch<any[]>(`/wp-json/wc/v3/products?per_page=${per}&page=${page}&search=${encodeURIComponent(title)}${extraQS}`)
        : await wcFetch<any[]>("products", params);
    };

    const fetchAllPage = async (page: number, per = 100, overrides?: { min_price?: string; max_price?: string }) => {
      const extraQS = buildBasicQS(overrides);
      const params: any = { per_page: per, page, ...buildParams(overrides) };
      return useBasic
        ? await wooFetch<any[]>(`/wp-json/wc/v3/products?per_page=${per}&page=${page}${extraQS}`)
        : await wcFetch<any[]>("products", params);
    };

    async function scan(overrides?: { min_price?: string; max_price?: string }) {
      const out: any[] = [];
      // Try up to 3 search pages first
      for (let page = 1; page <= 3; page++) {
        const batch = await fetchSearchPage(page, 50, overrides);
        out.push(...batch.filter((p) => productMatchesCollection(p, title)));
        if (out.length >= per_page || batch.length === 0) break;
      }

      // Fallback: scan general catalog pages if we still have few results
      if (out.length < Math.max(12, Math.floor(per_page / 2))) {
        for (let page = 1; page <= 10; page++) {
          const batch = await fetchAllPage(page, 100, overrides);
          out.push(...batch.filter((p) => productMatchesCollection(p, title)));
          if (out.length >= per_page * 2 || batch.length < 100) break;
        }
      }

      // Deduplicate by product id
      const seen = new Set<number>();
      const dedup = out.filter((p) => {
        const id = Number(p?.id || 0);
        if (!id) return false;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
      return dedup;
    }

    // Handle multi-select price ranges by unioning results across ranges
    if (price_ranges) {
      const tokens = price_ranges.split(",").map((t) => t.trim()).filter(Boolean);
      const ranges: Array<{ min: number; max?: number }> = [];
      for (const t of tokens) {
        if (/^\d+\+$/i.test(t)) {
          const n = Number(t.slice(0, -1));
          if (Number.isFinite(n)) ranges.push({ min: n });
        } else if (/^\d+-\d+$/i.test(t)) {
          const [a, b] = t.split("-");
          const min = Number(a);
          const max = Number(b);
          if (Number.isFinite(min) && Number.isFinite(max)) ranges.push({ min, max });
        }
      }
      if (ranges.length) {
        const minSuperset = Math.min(...ranges.map((r) => r.min));
        const hasUpper = ranges.some((r) => r.max != null);
        const maxSuperset = hasUpper ? Math.max(...ranges.map((r) => r.max ?? r.min)) : undefined;

        const superset = await scan({ min_price: String(minSuperset), max_price: maxSuperset != null ? String(maxSuperset) : undefined });
        const inRanges = (price: number) => ranges.some((r) => (r.max == null ? price >= r.min : price >= r.min && price <= r.max));
        const filtered = superset.filter((p) => inRanges(Number(p?.price || p?.sale_price || p?.regular_price || 0)));

        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / per_page));
        const start = (page - 1) * per_page;
        const out = filtered.slice(start, start + per_page);
        const headers = new Headers();
        headers.set("x-total", String(total));
        headers.set("x-total-pages", String(totalPages));
        headers.set("x-wp-total", String(total));
        headers.set("x-wp-totalpages", String(totalPages));
        return new NextResponse(JSON.stringify(out), { status: 200, headers });
      }
    }

    const dedup = await scan({ min_price: min_price || undefined, max_price: max_price || undefined });
    const total = dedup.length;
    const totalPages = Math.max(1, Math.ceil(total / per_page));
    const start = (page - 1) * per_page;
    const out = dedup.slice(start, start + per_page);
    const headers = new Headers();
    headers.set("x-total", String(total));
    headers.set("x-total-pages", String(totalPages));
    headers.set("x-wp-total", String(total));
    headers.set("x-wp-totalpages", String(totalPages));
    return new NextResponse(JSON.stringify(out), { status: 200, headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch products for collection", detail: message }, { status: 500 });
  }
}
