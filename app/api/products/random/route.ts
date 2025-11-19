// app/api/products/random/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wcFetch, wcFetchRaw } from "@/lib/woocommerce";
import { wooFetch, wooFetchRaw } from "@/lib/wooClient";
import type { WCProduct } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // never cache
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const per_page = searchParams.get("per_page") ?? "4";
    const unique = searchParams.get("unique") ?? undefined;
    const orderby = searchParams.get("orderby") ?? undefined; // optional passthrough
    const category = searchParams.get("category") ?? undefined; // optional passthrough

    const params: Record<string, string> = { per_page: String(per_page) };
    if (orderby) params.orderby = orderby;
    if (category) params.category = category;

    const useBasic = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);

    // Helper to build URLSearchParams from params
    const makeQS = (base: Record<string, string | number>) =>
      new URLSearchParams(Object.entries(base).reduce((acc, [k, v]) => {
        acc.set(k, String(v));
        return acc;
      }, new URLSearchParams()));

    // Unique random picks across catalog
    if (unique) {
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
      const flat = batches.flat();
      // Ensure unique products by id and limit to requested count
      const uniq = flat.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i).slice(0, Number(per_page) || 4);
      return NextResponse.json(uniq, { status: 200, headers: { "Cache-Control": "no-store" } });
    }

    // Single random slice
    const headRes = useBasic
      ? await wooFetchRaw(`/wp-json/wc/v3/products?per_page=1`)
      : await wcFetchRaw("products", { per_page: 1 });
    const total = Number(headRes.headers.get("x-wp-total") || "0");
    const limit = Number(per_page);
    const maxOffset = Math.max(0, total - limit);
    const offset = maxOffset > 0 ? Math.floor(Math.random() * maxOffset) : 0;

    const randomParams: Record<string, string | number> = { ...params, offset };
    const qs = makeQS(randomParams);
    const path = `/wp-json/wc/v3/products?${qs.toString()}`;
    const data = useBasic
      ? await wooFetch<WCProduct[]>(path)
      : await wcFetch<WCProduct[]>("products", randomParams as any);

    return NextResponse.json(data, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch random products", detail: message }, { status: 500 });
  }
}
