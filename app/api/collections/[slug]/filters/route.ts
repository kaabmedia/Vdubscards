// app/api/collections/[slug]/filters/route.ts
import { NextResponse } from "next/server";
import { wpGraphQL } from "@/lib/wp-graphql";
import { wcFetch } from "@/lib/woocommerce";
import { wooFetch } from "@/lib/wooClient";

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
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyName(s: string) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripPa(slug: string) {
  return String(slug || "").replace(/^pa_/, "").toLowerCase();
}

export async function GET(_req: Request, context: any) {
  try {
    const slug = context?.params?.slug as string | undefined;
    if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

    // 1) Resolve collection title via GraphQL
    const data = await wpGraphQL<WPCollectionBySlug>(GQL_BY_SLUG, { slug });
    const node = data?.collecties?.nodes?.[0];
    if (!node) return NextResponse.json({ price: { min: 0, max: 0 }, attributes: [] }, { status: 200 });
    const title = node.title;

    // 2) Gather products for this collection (re-using the same search+scan strategy)
    const useBasic = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);

    const fetchSearchPage = async (page: number, per = 50) => {
      return useBasic
        ? await wooFetch<any[]>(`/wp-json/wc/v3/products?per_page=${per}&page=${page}&search=${encodeURIComponent(title)}`)
        : await wcFetch<any[]>("products", { per_page: per, page, search: title } as any);
    };

    const fetchAllPage = async (page: number, per = 100) => {
      return useBasic
        ? await wooFetch<any[]>(`/wp-json/wc/v3/products?per_page=${per}&page=${page}`)
        : await wcFetch<any[]>("products", { per_page: per, page } as any);
    };

    const out: any[] = [];
    for (let page = 1; page <= 3; page++) {
      const batch = await fetchSearchPage(page, 50);
      out.push(...batch);
      if (out.length >= 200 || batch.length === 0) break;
    }
    if (out.length < 60) {
      for (let page = 1; page <= 8; page++) {
        const batch = await fetchAllPage(page, 100);
        out.push(...batch);
        if (out.length >= 600 || batch.length < 100) break;
      }
    }

    // Filter to products that match the collection title
    function approxMatch(a: string, b: string) {
      const na = normalize(a);
      const nb = normalize(b);
      if (!na || !nb) return false;
      if (na === nb) return true;
      return na.includes(nb) || nb.includes(na);
    }

    function productMatchesCollection(p: any) {
      const attrs: any[] = Array.isArray(p?.attributes) ? p.attributes : [];
      const candNames = new Set(["collection", "collectie", "pa_collection", "pa_collectie"]);
      for (const a of attrs) {
        const name = String(a?.name || a?.slug || "").toLowerCase();
        if (!name) continue;
        if ([...candNames].some((n) => name.includes(n))) {
          const options: string[] = Array.isArray(a?.options)
            ? a.options.map((o: any) => String(o))
            : a?.option
            ? [String(a.option)]
            : [];
          for (const opt of options) if (approxMatch(opt, title)) return true;
        }
      }
      const meta: any[] = Array.isArray(p?.meta_data) ? p.meta_data : [];
      for (const m of meta) {
        const key = String(m?.key || "").toLowerCase();
        const val = String(m?.value || "");
        if (!key || !val) continue;
        if (["collection", "collectie", "pa_collection", "pa_collectie"].some((n) => key.includes(n))) {
          if (approxMatch(val, title)) return true;
        }
      }
      return false;
    }

    const products = out.filter(productMatchesCollection);

    // 3) Compute price min/max across collection
    let min = 0;
    let max = 0;
    for (const p of products) {
      const priceNum = Number(p?.price || p?.sale_price || p?.regular_price || 0) || 0;
      if (!min || priceNum < min) min = priceNum;
      if (!max || priceNum > max) max = priceNum;
    }

    // 4) Build per-collection attribute usage map (by attribute key and term name)
    const used: Map<string, Set<string>> = new Map();
    for (const p of products) {
      const attrs: any[] = Array.isArray(p?.attributes) ? p.attributes : [];
      for (const a of attrs) {
        const keyRaw = String(a?.slug || "") || slugifyName(String(a?.name || ""));
        const key = stripPa(keyRaw);
        if (!key) continue;
        const set = used.get(key) || new Set<string>();
        const options: string[] = Array.isArray(a?.options)
          ? a.options.map((o: any) => String(o))
          : a?.option
          ? [String(a.option)]
          : [];
        for (const opt of options) set.add(normalize(opt));
        used.set(key, set);
      }
    }

    // 5) Fetch global attributes + terms and filter to collection-relevant ones
    const attrs = useBasic
      ? await wooFetch<any[]>(`/wp-json/wc/v3/products/attributes?per_page=100`)
      : await wcFetch<any[]>(`products/attributes`, { per_page: 100 } as any);

    const relevant: Array<{ id: number; name: string; slug: string; terms: { id: number; name: string; slug: string }[] }> = [];

    for (const a of attrs || []) {
      const key = stripPa(String(a?.slug || a?.name || ""));
      if (!key || !used.has(key)) continue;
      let terms: any[] = [];
      try {
        terms = useBasic
          ? await wooFetch<any[]>(`/wp-json/wc/v3/products/attributes/${a.id}/terms?per_page=100`)
          : await wcFetch<any[]>(`products/attributes/${a.id}/terms`, { per_page: 100 } as any);
      } catch {
        terms = [];
      }
      const set = used.get(key)!;
      const filt = (terms || [])
        .filter((t: any) => set.has(normalize(t?.name || "")))
        .map((t: any) => ({ id: Number(t.id), name: String(t.name), slug: String(t.slug) }));
      if (filt.length) relevant.push({ id: Number(a.id), name: String(a.name), slug: String(a.slug), terms: filt });
    }

    return NextResponse.json({ price: { min, max }, attributes: relevant }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to build collection filters", detail: message }, { status: 500 });
  }
}
