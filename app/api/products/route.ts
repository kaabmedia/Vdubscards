// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wcFetch, wcFetchRaw } from "@/lib/woocommerce";
import { wooFetch, wooFetchRaw } from "@/lib/wooClient";
import { WCProduct } from "@/lib/types";

export const runtime = "nodejs";
// Do not cache this route so sale filters stay accurate
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") ?? undefined;
    const per_page = searchParams.get("per_page") ?? "12";
    const perPageNum = Math.max(1, Number(per_page) || 12);
    const search = searchParams.get("search") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const slug = searchParams.get("slug") ?? undefined;
    const orderby = searchParams.get("orderby") ?? undefined;
    const on_sale_raw = searchParams.get("on_sale");
    const on_sale = (() => {
      if (on_sale_raw == null) return undefined;
      const v = String(on_sale_raw).toLowerCase();
      if (v === "1" || v === "true" || v === "yes") return "true";
      if (v === "0" || v === "false" || v === "no") return undefined;
      return v;
    })();
    const featured = searchParams.get("featured") ?? undefined;
    const random = searchParams.get("random") ?? undefined;
    const unique = searchParams.get("unique") ?? undefined;
    const min_price = searchParams.get("min_price") ?? undefined;
    const max_price = searchParams.get("max_price") ?? undefined;
    const price_ranges = searchParams.get("price_ranges") ?? undefined;

    // Collect attribute filters: attr_<slug>=commaSeparatedTermIds
    const attrFilters: Array<{ slug: string; terms: string }> = [];
    searchParams.forEach((value, key) => {
      if (key.startsWith("attr_")) {
        const slug = key.substring(5);
        if (value) attrFilters.push({ slug, terms: value });
      }
    });

    const wantSaleOnly = on_sale === "true";

    const params: Record<string, string> = {
      per_page: String(per_page),
    };
    if (page) params.page = String(page);
    if (search) params.search = search;
    if (category) params.category = category;
    if (slug) params.slug = slug;
    if (orderby) params.orderby = orderby;
    if (on_sale) params.on_sale = on_sale;
    if (featured) params.featured = featured;
    if (min_price) params.min_price = String(min_price);
    if (max_price) params.max_price = String(max_price);

    const useBasic = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);

    const isSaleProduct = (p: WCProduct) => {
      if (!p) return false;
      // Get price values - handle both REST API and Store API formats
      const price = Number((p as any).price ?? (p as any).prices?.price);
      const sale = Number((p as any).sale_price ?? (p as any).prices?.sale_price);
      const regular = Number(
        (p as any).regular_price ??
        (p as any).prices?.regular_price ??
        (p as any).prices?.regular_price_min ??
        (p as any).prices?.regular_price_max
      );
      // Require an actual price difference, not just the on_sale flag
      if (Number.isFinite(sale) && sale > 0 && Number.isFinite(regular) && regular > 0 && sale < regular) return true;
      if (Number.isFinite(price) && price > 0 && Number.isFinite(regular) && regular > 0 && price < regular) return true;
      return false;
    };

    // Random mode: compute random slice or unique random picks across catalog
    if (random && unique) {
      const headRes = useBasic
        ? await wooFetchRaw(`/wp-json/wc/v3/products?per_page=1`)
        : await wcFetchRaw("products", { per_page: 1 });
      const total = Number(headRes.headers.get("x-wp-total") || "0");
      const count = Number(per_page) || 4;
      const maxIndex = Math.max(0, total - 1);
      const offsets = new Set<number>();
      while (offsets.size < Math.min(count, total)) {
        offsets.add(Math.floor(Math.random() * (maxIndex + 1)));
      }

      const qryBase = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) qryBase.set(k, String(v));
      }
      qryBase.delete("per_page");
      qryBase.delete("offset");

      const requests = Array.from(offsets).map((offset) => {
        const qs = new URLSearchParams(qryBase);
        qs.set("per_page", "1");
        qs.set("offset", String(offset));
        const path = `/wp-json/wc/v3/products?${qs.toString()}`;
        return useBasic
          ? wooFetch<WCProduct[]>(path)
          : wcFetch<WCProduct[]>("products", { ...Object.fromEntries(qryBase), per_page: 1, offset } as any);
      });

      const batches = await Promise.all(requests);
      let flat = batches.flat();
      if (wantSaleOnly) flat = flat.filter(isSaleProduct);
      return NextResponse.json(flat, { status: 200 });
    }

    if (random) {
      const headRes = useBasic
        ? await wooFetchRaw(`/wp-json/wc/v3/products?per_page=1`)
        : await wcFetchRaw("products", { per_page: 1 });
      const total = Number(headRes.headers.get("x-wp-total") || "0");
      const limit = Number(per_page);
      const maxOffset = Math.max(0, total - limit);
      const offset = maxOffset > 0 ? Math.floor(Math.random() * maxOffset) : 0;

      const randomParams: Record<string, string | number> = { ...params, offset };
      const qs = new URLSearchParams(Object.entries(randomParams).reduce((acc, [k, v]) => { acc.set(k, String(v)); return acc; }, new URLSearchParams()));
      const path = `/wp-json/wc/v3/products?${qs.toString()}`;
      let res = useBasic ? await wooFetch<WCProduct[]>(path) : await wcFetch<WCProduct[]>("products", randomParams as any);
      if (wantSaleOnly) res = res.filter(isSaleProduct);
      return NextResponse.json(res, { status: 200 });
    }

    // Helper to fetch products with current params, attributes, and provided overrides
    async function fetchWith(overrides: Record<string, string | number | undefined>): Promise<WCProduct[]> {
      const merged: Record<string, any> = { ...params, ...overrides };
      if (useBasic) {
        const qs = new URLSearchParams(merged as Record<string, string>);
        for (const f of attrFilters) {
          const tax = f.slug.startsWith("pa_") ? f.slug : `pa_${f.slug}`;
          qs.append("attribute", tax);
          qs.append("attribute_term", f.terms);
        }
        const path = `/wp-json/wc/v3/products?${qs.toString()}`;
        return await wooFetch<WCProduct[]>(path);
      } else {
        if (attrFilters.length) {
          const first = attrFilters[0];
          const tax = first.slug.startsWith("pa_") ? first.slug : `pa_${first.slug}`;
          return await wcFetch<WCProduct[]>("products", { ...merged, attribute: tax, attribute_term: first.terms } as any);
        } else {
          return await wcFetch<WCProduct[]>("products", merged as any);
        }
      }
    }

    // If multiple price ranges are provided, union results across ranges and de-duplicate
    if (price_ranges) {
      const tokens = price_ranges.split(",").map((t) => t.trim()).filter(Boolean);
      const rangesParsed: Array<{ min: number; max?: number }> = [];
      for (const t of tokens) {
        // support formats: "min-max" and "min+"
        if (/^\d+\+$/i.test(t)) {
          const min = Number(t.slice(0, -1));
          if (Number.isFinite(min)) rangesParsed.push({ min });
        } else if (/^\d+-\d+$/i.test(t)) {
          const [a, b] = t.split("-");
          const min = Number(a);
          const max = Number(b);
          if (Number.isFinite(min) && Number.isFinite(max)) rangesParsed.push({ min, max });
        }
      }

      // Fallback: if no valid tokens parsed, continue with default path
      if (rangesParsed.length) {
        const perPageNum = Number(per_page) || 24;
        const pageNum = Math.max(1, Number(page || "1"));
        const requests = rangesParsed.map((r) =>
          fetchWith({ min_price: String(r.min), max_price: r.max != null ? String(r.max) : undefined })
        );
        const batches = await Promise.all(requests);
        let flat = batches.flat();
        if (wantSaleOnly) flat = flat.filter(isSaleProduct);
        const dedup = new Map<number, WCProduct>();
        for (const p of flat) dedup.set(p.id, p);
        const all = Array.from(dedup.values());
        const total = all.length;
        const totalPages = Math.max(1, Math.ceil(total / perPageNum));
        const start = (pageNum - 1) * perPageNum;
        const out = all.slice(start, start + perPageNum);
        const headers = new Headers();
        headers.set("x-total", String(total));
        headers.set("x-total-pages", String(totalPages));
        headers.set("x-wp-total", String(total));
        headers.set("x-wp-totalpages", String(totalPages));
        return new NextResponse(JSON.stringify(out), { status: 200, headers });
      }
    }

    // Default path: fetch via raw to forward pagination headers
    if (useBasic) {
      const qs = new URLSearchParams(params as Record<string, string>);
      for (const f of attrFilters) {
        const tax = f.slug.startsWith("pa_") ? f.slug : `pa_${f.slug}`;
        qs.append("attribute", tax);
        qs.append("attribute_term", f.terms);
      }
      const path = `/wp-json/wc/v3/products?${qs.toString()}`;
      const res = await wooFetchRaw(path);
      let body = await res.json();
      if (wantSaleOnly && Array.isArray(body)) body = body.filter(isSaleProduct);
      const headers = new Headers();
      const total = Array.isArray(body) ? String(body.length) : res.headers.get("x-wp-total") || "0";
      const totalPages = Array.isArray(body) ? String(Math.max(1, Math.ceil(body.length / perPageNum))) : res.headers.get("x-wp-totalpages") || "0";
      headers.set("x-wp-total", total);
      headers.set("x-wp-totalpages", totalPages);
      headers.set("cache-control", "no-store");
      return new NextResponse(JSON.stringify(body), { status: 200, headers });
    } else {
      // Non-basic auth client can't send repeated params easily; include only the first attribute filter when present
      let res: Response;
      if (attrFilters.length) {
        const first = attrFilters[0];
        const tax = first.slug.startsWith("pa_") ? first.slug : `pa_${first.slug}`;
        res = await wcFetchRaw("products", { ...params, attribute: tax, attribute_term: first.terms } as any);
      } else {
        res = await wcFetchRaw("products", params);
      }
      let body = await res.json();
      if (wantSaleOnly && Array.isArray(body)) body = body.filter(isSaleProduct);
      const headers = new Headers();
      const total = Array.isArray(body) ? String(body.length) : res.headers.get("x-wp-total") || "0";
      const totalPages = Array.isArray(body) ? String(Math.max(1, Math.ceil(body.length / perPageNum))) : res.headers.get("x-wp-totalpages") || "0";
      headers.set("x-wp-total", total);
      headers.set("x-wp-totalpages", totalPages);
      headers.set("cache-control", "no-store");
      return new NextResponse(JSON.stringify(body), { status: 200, headers });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const useBasicDebug = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);
    const base = process.env.WC_BASE_URL || process.env.WOOCOMMERCE_URL || "unset";
    // Avoid leaking secrets; include minimal debug info to help diagnose connectivity.
    return NextResponse.json(
      { error: "Failed to fetch products", detail: message, debug: { base, auth: useBasicDebug ? "basic" : "query" } },
      { status: 500 }
    );
  }
}
