// app/product/[slug]/page.tsx
import { notFound } from "next/navigation";
import type { WCProduct } from "@/lib/types";
import { formatEUR } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getBaseUrl } from "@/lib/server-url";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductGallery } from "@/components/product/product-gallery";

async function getProduct(slug: string): Promise<WCProduct | null> {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/products?slug=${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const arr = (await res.json()) as WCProduct[];
    return arr[0] ?? null;
  } catch {
    return null;
  }
}

export default async function ProductDetail({ params }: any) {
  const product = await getProduct(params.slug);
  if (!product) return notFound();

  const regular = Number(product.regular_price || product.price || 0);
  const sale = Number(product.sale_price || 0);
  const isSale = Boolean(product.on_sale && sale > 0 && sale < (regular || Number(product.price || 0)));
  const price = isSale ? sale : Number(product.price || product.regular_price || 0);
  const image = product.images?.[0]?.src ?? "";
  const alt = product.images?.[0]?.alt ?? product.name;
  const outOfStock = (product.stock_status && product.stock_status !== "instock") || (typeof product.stock_quantity === "number" && product.stock_quantity <= 0);

  return (
    <div className="grid gap-10 md:grid-cols-5 pb-16">
      <div className="md:col-span-2">
        <ProductGallery images={product.images || []} soldOut={outOfStock} />
      </div>
      <div className="md:col-span-3">
        <div className="border bg-card p-6 shadow-card rounded-none space-y-6">
          <div className="space-y-2 border-b pb-4">
            <div className="flex items-start justify-between gap-2">
              <h1>{product.name}</h1>
              {outOfStock ? (
                <Badge className="bg-destructive text-destructive-foreground">Out of stock</Badge>
              ) : null}
            </div>
            <div className="text-lg text-muted-foreground">
              {price ? (
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-semibold ${isSale ? "text-destructive" : "text-foreground"}`}>{formatEUR(price)}</span>
                  {isSale && regular ? (
                    <span className="text-base line-through text-muted-foreground">{formatEUR(regular)}</span>
                  ) : null}
                </div>
              ) : (
                "—"
              )}
            </div>
          </div>
          {product.short_description ? (
            <div
              className="prose prose-sm prose-neutral max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          ) : null}
          <div className="flex items-center gap-3">
            {outOfStock ? null : (
              <AddToCartButton productId={product.id} className="h-10 px-6 rounded-none bg-black text-white hover:bg-black/90" />)
            }
            <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
              Continue shopping
            </Link>
          </div>
          <div className="border-t pt-4 text-xs text-muted-foreground">
            Levering 1–3 werkdagen binnen NL. Gratis verzending vanaf €125. Retour binnen 14 dagen.
          </div>
        </div>
      </div>
    </div>
  );
}
