// app/api/products/[id]/route.ts
import { NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce";
import { wooFetch } from "@/lib/wooClient";
import { WCProduct } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(_req: Request, { params }: any) {
  try {
    const useBasic = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);
    const product = useBasic
      ? await wooFetch<WCProduct>(`/wp-json/wc/v3/products/${params.id}`)
      : await wcFetch<WCProduct>(`products/${params.id}`);
    return NextResponse.json(product, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch product", detail: message }, { status: 500 });
  }
}
