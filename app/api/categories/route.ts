// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce";
import type { WCCategory } from "@/lib/types";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const per_page = searchParams.get("per_page") ?? "50";
    const parent = searchParams.get("parent") ?? undefined;
    const hide_empty = searchParams.get("hide_empty") ?? "true";
    const params: Record<string, string> = { per_page, hide_empty };
    if (parent) params.parent = parent;
    const categories = await wcFetch<WCCategory[]>("products/categories", params);
    return NextResponse.json(categories, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch categories", detail: message }, { status: 500 });
  }
}
