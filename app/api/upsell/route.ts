// app/api/upsell/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce";
import { wooFetch } from "@/lib/wooClient";
import type { WCProduct } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids") || "";
    const limit = Math.max(1, Math.min(12, Number(searchParams.get("limit") || 4)));
    const perCat = Math.max(1, Math.min(12, Number(searchParams.get("per") || 6)));
    const catCap = Math.max(1, Math.min(6, Number(searchParams.get("cats") || 3)));

    const ids = idsParam
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n));

    if (!ids.length) return NextResponse.json([], { status: 200 });

    const useBasic = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);

    // 1) Fetch details for cart items in a single request
    let inCart: WCProduct[] = [];
    if (useBasic) {
      const qs = new URLSearchParams({ include: ids.join(","), per_page: String(ids.length) });
      const path = `/wp-json/wc/v3/products?${qs.toString()}`;
      inCart = await wooFetch<WCProduct[]>(path);
    } else {
      inCart = await wcFetch<WCProduct[]>("products", { include: ids.join(","), per_page: ids.length });
    }

    // 2) Build a category frequency map from cart products
    const freq = new Map<number, number>();
    for (const p of inCart) {
      const cats: any[] = Array.isArray((p as any)?.categories) ? (p as any).categories : [];
      for (const c of cats) {
        const id = Number(c?.id);
        if (!Number.isFinite(id)) continue;
        freq.set(id, (freq.get(id) || 0) + 1);
      }
    }

    const sortedCats = Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, catCap)
      .map(([id]) => id);

    if (sortedCats.length === 0) return NextResponse.json([], { status: 200 });

    // 3) Fetch candidates per category (excluding items already in cart)
    const cartSet = new Set(ids);
    const candidates: WCProduct[] = [];

    for (const catId of sortedCats) {
      if (useBasic) {
        const qs = new URLSearchParams({
          category: String(catId),
          per_page: String(perCat),
          exclude: ids.join(","),
        });
        const path = `/wp-json/wc/v3/products?${qs.toString()}`;
        const list = await wooFetch<WCProduct[]>(path);
        candidates.push(...list);
      } else {
        const list = await wcFetch<WCProduct[]>("products", {
          category: catId,
          per_page: perCat,
          exclude: ids.join(","),
        } as any);
        candidates.push(...list);
      }
      if (candidates.length >= limit * 2) break; // stop early if we already have enough variety
    }

    // 4) Deduplicate and cap
    const seen = new Set<number>();
    const out: WCProduct[] = [];
    for (const p of candidates) {
      const pid = Number((p as any)?.id || 0);
      if (!pid || cartSet.has(pid) || seen.has(pid)) continue;
      seen.add(pid);
      out.push(p);
      if (out.length >= limit) break;
    }

    return NextResponse.json(out, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

