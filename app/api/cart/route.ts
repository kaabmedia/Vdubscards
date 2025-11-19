// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce";
import { wooFetch } from "@/lib/wooClient";
import type { WCProduct } from "@/lib/types";

export const runtime = "nodejs";

const CART_COOKIE = "vdubscards_cart";

type CartItem = { productId: number; quantity: number };
type Cart = { items: CartItem[] };

function readCart(req: NextRequest): Cart {
  const raw = req.cookies.get(CART_COOKIE)?.value;
  if (!raw) return { items: [] };
  try {
    return JSON.parse(raw) as Cart;
  } catch {
    return { items: [] };
  }
}

function writeCart(res: NextResponse, cart: Cart) {
  res.cookies.set(CART_COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
}

export async function GET(req: NextRequest) {
  const cart = readCart(req);
  return NextResponse.json(cart);
}

export async function POST(req: NextRequest) {
  const cart = readCart(req);
  const body = (await req.json().catch(() => null)) as any;
  const productId = typeof body?.productId === "string" ? Number(body.productId) : body?.productId;
  const quantityRaw = body?.quantity ?? 1;
  const quantity = typeof quantityRaw === "string" ? Number(quantityRaw) : quantityRaw;

  if (!productId || isNaN(productId) || !quantity || isNaN(quantity)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Validate stock against WooCommerce
  if (quantity > 0) {
    try {
      const useBasic = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);
      const product: WCProduct = useBasic
        ? await wooFetch(`/wp-json/wc/v3/products/${productId}`)
        : await wcFetch(`products/${productId}`);
      if (product.stock_status && product.stock_status !== "instock") {
        return NextResponse.json({ error: "Product is out of stock" }, { status: 409 });
      }
      const existingQty = cart.items.find((i) => i.productId === productId)?.quantity ?? 0;
      const available = typeof product.stock_quantity === "number" ? product.stock_quantity : Infinity;
      if (existingQty + quantity > available) {
        const left = Math.max(available - existingQty, 0);
        return NextResponse.json(
          { error: left > 0 ? `Only ${left} in stock` : "No stock left" },
          { status: 409 }
        );
      }
    } catch (e) {
      // If stock validation fails, do NOT allow adding. Surface error.
      return NextResponse.json({ error: "Stock validation failed" }, { status: 503 });
    }
  }

  const existingIndex = cart.items.findIndex((i) => i.productId === productId);
  if (existingIndex !== -1) {
    const newQty = cart.items[existingIndex].quantity + quantity;
    if (newQty <= 0) {
      cart.items.splice(existingIndex, 1);
    } else {
      cart.items[existingIndex].quantity = newQty;
    }
  } else {
    if (quantity > 0) {
      cart.items.push({ productId, quantity });
    } else {
      // negative add for non-existing item -> no-op
      const res = NextResponse.json(cart, { status: 200 });
      writeCart(res, cart);
      return res;
    }
  }

  const res = NextResponse.json(cart, { status: 200 });
  writeCart(res, cart);
  return res;
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const pidParam = url.searchParams.get("productId");
  const body = await req.text();
  let bodyId: number | undefined;
  try {
    const parsed = JSON.parse(body || "null");
    if (parsed && typeof parsed.productId !== "undefined") bodyId = Number(parsed.productId);
  } catch {}

  const productId = pidParam ? Number(pidParam) : bodyId;

  if (productId && !isNaN(productId)) {
    const cart = readCart(req);
    cart.items = cart.items.filter((i) => i.productId !== productId);
    const res = NextResponse.json(cart, { status: 200 });
    writeCart(res, cart);
    return res;
  }

  const res = NextResponse.json({ items: [] as CartItem[] }, { status: 200 });
  writeCart(res, { items: [] });
  return res;
}
