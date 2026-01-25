// components/product/product-card.tsx
import Link from "next/link";
import type { Route } from "next";
import { WishlistToggle } from "@/components/wishlist/wishlist-toggle";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatEUR } from "@/lib/currency";
import type { WCProduct } from "@/lib/types";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import Image from "next/image";

export function ProductCard({ product }: { product: WCProduct }) {
  const regular = Number(product.regular_price || product.price || 0);
  const sale = Number(product.sale_price || 0);
  const isSale = Boolean(product.on_sale && sale > 0 && sale < (regular || Number(product.price || 0)));
  const price = isSale ? sale : Number(product.price || product.regular_price || 0);
  const image = product.images?.[0]?.src ?? "";
  const alt = product.images?.[0]?.alt ?? product.name;
  const hoverImage = product.images?.[1]?.src ?? null;
  const href = `/product/${product.slug}` as Route;
  const outOfStock = (product.stock_status && product.stock_status !== "instock") || (typeof product.stock_quantity === "number" && product.stock_quantity <= 0);

  return (
    <div className="group rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
      <Link href={href} className="block">
        <div className="relative aspect-[3/4] bg-muted">
          {/* Wishlist toggle: hide when out of stock */}
          {!outOfStock ? (
            <div className="absolute right-1.5 top-1.5 z-20">
              <WishlistToggle id={product.id} />
            </div>
          ) : null}
          {outOfStock ? (
            <div className="absolute left-2 top-2 z-20">
              <Badge variant="secondary">Out of stock</Badge>
            </div>
          ) : null}
          {!outOfStock && isSale ? (
            <div className="absolute left-2 top-2 z-20">
              <Badge variant="sale">Sale</Badge>
            </div>
          ) : null}
          {image ? (
            <>
              <Image
                src={image}
                alt={alt}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
                className="absolute inset-0 object-cover transition-opacity duration-300 group-hover:opacity-0"
              />
              {hoverImage ? (
                <Image
                  src={hoverImage}
                  alt={alt}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
                  className="absolute inset-0 object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              ) : null}
              {outOfStock ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                  <span className="px-3 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wide">Sold out</span>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </Link>
      <CardHeader className="p-4 pb-3">
        <CardTitle className="flex items-start justify-between gap-2 text-base">
          <Link href={href} className="line-clamp-1 hover:underline">
            {product.name}
          </Link>
          {/* Sale badge moved to image top-left */}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-5 pt-0">
        <div className="space-y-3">
          <div className="text-base md:text-lg font-semibold leading-none">
            {price ? (
              <div className="flex items-baseline gap-2">
                <span className={isSale ? "text-destructive" : undefined}>{formatEUR(price)}</span>
                {isSale && regular ? (
                  <span className="text-sm font-normal line-through text-muted-foreground">{formatEUR(regular)}</span>
                ) : null}
              </div>
            ) : (
              "—"
            )}
          </div>
          {outOfStock ? null : (
            <AddToCartButton
              productId={product.id}
              className="w-full h-10 rounded-md bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
            />
          )}
        </div>
      </CardContent>
    </div>
  );
}
