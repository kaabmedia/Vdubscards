// app/api/filters/route.ts
import { NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce";
import { wooFetch } from "@/lib/wooClient";

export const runtime = "nodejs";
export const revalidate = 300;

type Attr = { id: number; name: string; slug: string };

export async function GET() {
  try {
    const useBasic = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);

    // 1) Attributes and terms
    const attrs: Attr[] = useBasic
      ? await wooFetch<Attr[]>(`/wp-json/wc/v3/products/attributes?per_page=100`)
      : await wcFetch<Attr[]>(`products/attributes`, { per_page: 100 } as any);

    const enriched = [] as Array<Attr & { terms: { id: number; name: string; slug: string }[] }>;
    for (const a of attrs) {
      try {
        const terms = useBasic
          ? await wooFetch<any[]>(`/wp-json/wc/v3/products/attributes/${a.id}/terms?per_page=100`)
          : await wcFetch<any[]>(`products/attributes/${a.id}/terms`, { per_page: 100 } as any);
        enriched.push({ ...a, terms: (terms || []).map((t: any) => ({ id: Number(t.id), name: String(t.name), slug: String(t.slug) })) });
      } catch {
        enriched.push({ ...a, terms: [] });
      }
    }

    // 2) Price range (min/max)
    async function one(order: "asc" | "desc") {
      const path = `/wp-json/wc/v3/products?per_page=1&orderby=price&order=${order}`;
      const list = useBasic ? await wooFetch<any[]>(path) : await wcFetch<any[]>("products", { per_page: 1, orderby: "price", order } as any);
      const p = list?.[0];
      const price = p ? Number(p.price || p.regular_price || 0) : 0;
      return price || 0;
    }
    const [min, max] = await Promise.all([one("asc"), one("desc")]);

    return NextResponse.json({ price: { min, max }, attributes: enriched }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

