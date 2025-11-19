// app/api/checkout/start/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce";
import { wooFetch } from "@/lib/wooClient";
import type { WCProduct } from "@/lib/types";

export const runtime = "nodejs";

const CART_COOKIE = "vdubscards_cart";

type CartItem = { productId: number; quantity: number };
type Cart = { items: CartItem[] };

type StartPayload = {
  email?: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  postcode?: string;
  country?: string; // ISO-2, e.g. NL
  provider?: "stripe" | "cod";
};

function readCart(req: NextRequest): Cart {
  const raw = req.cookies.get(CART_COOKIE)?.value;
  if (!raw) return { items: [] };
  try {
    return JSON.parse(raw) as Cart;
  } catch {
    return { items: [] };
  }
}

function currencyToMinorUnits(price: string): number {
  // Woo returns prices as strings like "12.34"
  const n = Number(price);
  return Math.round(n * 100);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as StartPayload;
  const provider = (body.provider || process.env.CHECKOUT_PROVIDER || "cod") as
    | "stripe"
    | "cod";

  const cart = readCart(req);
  if (!cart.items.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Load product data to validate stock and prices
  const ids = cart.items.map((i) => i.productId);

  const useBasic = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);
  const products: WCProduct[] = useBasic
    ? await wooFetch(`/wp-json/wc/v3/products?include=${ids.join(",")}&per_page=${ids.length}`)
    : await wcFetch(`products`, { include: ids.join(","), per_page: ids.length });

  const map = new Map<number, WCProduct>();
  for (const p of products) map.set(p.id, p);

  // Build order line items and compute subtotal
  const line_items = [] as { product_id: number; quantity: number }[];
  let subtotal = 0;
  for (const item of cart.items) {
    const p = map.get(item.productId);
    if (!p) return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 409 });
    if (p.stock_status && p.stock_status !== "instock") {
      return NextResponse.json({ error: `${p.name} is out of stock` }, { status: 409 });
    }
    const available = typeof p.stock_quantity === "number" ? p.stock_quantity : Infinity;
    if (item.quantity > available) {
      return NextResponse.json({ error: `Only ${available} of ${p.name} in stock` }, { status: 409 });
    }
    line_items.push({ product_id: p.id, quantity: item.quantity });
    subtotal += currencyToMinorUnits(p.price) * item.quantity;
  }

  // If Stripe is configured and selected, create a Checkout Session and redirect there.
  if (provider === "stripe" && process.env.STRIPE_SECRET_KEY) {
    try {
      const origin = new URL(req.url).origin;
      // Dynamic import so the app can run without stripe installed when not used
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Stripe = (await import("stripe")).default as any;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" });

      const lineItems = cart.items.map((item) => {
        const p = map.get(item.productId)!;
        return {
          quantity: item.quantity,
          price_data: {
            currency: (process.env.CHECKOUT_CURRENCY || "eur").toLowerCase(),
            unit_amount: currencyToMinorUnits(p.price),
            product_data: {
              name: p.name,
              metadata: { wc_product_id: String(p.id) },
            },
          },
        };
      });

      const allowedCountries: string[] = (process.env.CHECKOUT_ALLOWED_COUNTRIES || "NL,BE,DE")
        .split(",")
        .map((c: string) => c.trim())
        .filter(Boolean);

      // Try to prefill customer details
      const fullName = [body.firstName || "", body.lastName || ""].filter(Boolean).join(" ");
      const stripeAddress = {
        line1: body.address1 || undefined,
        line2: body.address2 || undefined,
        city: body.city || undefined,
        postal_code: body.postcode || undefined,
        country: (body.country || undefined) as string | undefined,
      } as any;

      let customerId: string | undefined = undefined;
      if (body.email) {
        try {
          const existing = await stripe.customers.list({ email: body.email, limit: 1 });
          const cust = existing?.data?.[0];
          if (cust) {
            customerId = cust.id;
            // Best-effort update of name/address so Checkout can prefill
            await stripe.customers.update(cust.id, {
              name: fullName || undefined,
              address: stripeAddress,
              shipping: fullName || stripeAddress.line1 ? { name: fullName || undefined, address: stripeAddress } : undefined,
            });
          } else {
            const created = await stripe.customers.create({
              email: body.email,
              name: fullName || undefined,
              address: stripeAddress,
              shipping: fullName || stripeAddress.line1 ? { name: fullName || undefined, address: stripeAddress } : undefined,
            });
            customerId = created.id;
          }
        } catch {}
      }

      const sessionParams: any = {
        mode: "payment",
        billing_address_collection: "auto",
        shipping_address_collection: { allowed_countries: allowedCountries },
        customer_update: { name: "auto", address: "auto", shipping: "auto" },
        line_items: lineItems,
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout/cancel`,
        metadata: {
          cart: JSON.stringify(cart.items),
          first_name: body.firstName || "",
          last_name: body.lastName || "",
          address_1: body.address1 || "",
          address_2: body.address2 || "",
          city: body.city || "",
          postcode: body.postcode || "",
          country: body.country || "",
        },
      };
      if (customerId) {
        sessionParams.customer = customerId;
      } else if (body.email) {
        sessionParams.customer_email = body.email;
        sessionParams.customer_creation = "if_required";
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      return NextResponse.json({ provider: "stripe", redirectUrl: session.url as string });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || "Stripe error" }, { status: 500 });
    }
  }

  // Fallback headless flow: create WooCommerce order immediately with COD
  const orderPayload: any = {
    payment_method: "cod",
    payment_method_title: "Cash on delivery",
    set_paid: false,
    line_items,
    billing: {
      first_name: body.firstName || "",
      last_name: body.lastName || "",
      address_1: body.address1 || "",
      address_2: body.address2 || "",
      city: body.city || "",
      postcode: body.postcode || "",
      country: body.country || "",
      email: body.email || "",
    },
    shipping: {
      first_name: body.firstName || "",
      last_name: body.lastName || "",
      address_1: body.address1 || "",
      address_2: body.address2 || "",
      city: body.city || "",
      postcode: body.postcode || "",
      country: body.country || "",
    },
  };

  const useBasicCreate = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);
  const created = useBasicCreate
    ? await wooFetch<any>(`/wp-json/wc/v3/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })
    : await wcFetch<any>(`orders`, undefined, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

  const res = NextResponse.json({ provider: "cod", order: { id: created.id }, redirectUrl: "/checkout/success?orderId=" + created.id });
  // Clear cart on success
  res.cookies.set(CART_COOKIE, JSON.stringify({ items: [] }), { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
