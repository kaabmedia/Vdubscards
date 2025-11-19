// app/api/products/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wcFetch, wcFetchRaw } from "@/lib/woocommerce";
import { wooFetch, wooFetchRaw } from "@/lib/wooClient";
import type { WCProduct } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids") || "";
    const ids = idsParam
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));
    if (!ids.length) return NextResponse.json([], { status: 200 });

    const useBasic = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);

    let products: WCProduct[] = [];
    if (useBasic) {
      const qs = new URLSearchParams({ include: ids.join(","), per_page: String(ids.length) });
      const path = `/wp-json/wc/v3/products?${qs.toString()}`;
      products = await wooFetch<WCProduct[]>(path);
    } else {
      products = await wcFetch<WCProduct[]>("products", { include: ids.join(","), per_page: ids.length });
    }
    // Keep order roughly as provided in ids
    const map = new Map(products.map((p) => [p.id, p] as const));
    const ordered: WCProduct[] = ids.map((id) => map.get(id)).filter(Boolean) as WCProduct[];
    return NextResponse.json(ordered, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

