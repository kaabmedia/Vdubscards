// app/api/checkout/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce";
import { wooFetch } from "@/lib/wooClient";

export const runtime = "nodejs";

const CART_COOKIE = "vdubscards_cart";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as any;
  const sessionId = body.session_id || body.sessionId;

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    // Dynamic import to keep optional
    const Stripe = (await import("stripe")).default as any;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 409 });
    }

    // Extract our cart from metadata
    const items: { productId: number; quantity: number }[] = session.metadata?.cart
      ? JSON.parse(session.metadata.cart)
      : [];

    if (!items.length) {
      // Fallback: fetch line items and try to read metadata on products
      const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 100 });
      for (const li of lineItems.data) {
        const pid = Number((li.price?.product as any)?.metadata?.wc_product_id) || 0;
        if (pid && li.quantity) items.push({ productId: pid, quantity: li.quantity });
      }
    }

    if (!items.length) {
      return NextResponse.json({ error: "Unable to determine items for order" }, { status: 500 });
    }

    const line_items = items.map((i) => ({ product_id: i.productId, quantity: i.quantity }));

    const cd = session.customer_details as any;
    const billing = cd
      ? {
          first_name: (cd.name || "").split(" ").slice(0, -1).join(" ") || cd.name || "",
          last_name: (cd.name || "").split(" ").slice(-1).join(" ") || "",
          address_1: cd.address?.line1 || "",
          address_2: cd.address?.line2 || "",
          city: cd.address?.city || "",
          postcode: cd.address?.postal_code || "",
          country: cd.address?.country || "",
          email: cd.email || "",
        }
      : undefined;
    const shipping = billing ? { ...billing } : undefined;
    const orderPayload: any = {
      payment_method: "stripe",
      payment_method_title: "Stripe",
      set_paid: true,
      status: "processing",
      line_items,
      ...(billing ? { billing } : {}),
      ...(shipping ? { shipping } : {}),
      meta_data: [
        { key: "stripe_session_id", value: sessionId },
        { key: "stripe_payment_intent", value: session.payment_intent || "" },
      ],
    };

    const useBasic = Boolean(process.env.WC_BASE_URL && process.env.WC_KEY && process.env.WC_SECRET);
    const created = useBasic
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

    const res = NextResponse.json({ order: { id: created.id } });
    // Clear cart
    res.cookies.set(CART_COOKIE, JSON.stringify({ items: [] }), { httpOnly: true, sameSite: "lax", path: "/" });
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Stripe error" }, { status: 500 });
  }
}
