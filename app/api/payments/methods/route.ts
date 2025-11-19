// app/api/payments/methods/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 3600; // cache for 1 hour; payment methods change rarely

type PMKey =
  | "card"
  | "ideal"
  | "klarna"
  | "bancontact"
  | "giropay"
  | "eps"
  | "sofort"
  | "paypal"
  | "apple_pay"
  | "link";

const WHITELIST: PMKey[] = [
  "card",
  "ideal",
  "klarna",
  "bancontact",
  "giropay",
  "eps",
  "sofort",
  "paypal",
  "apple_pay",
  "link",
];

export async function GET() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ methods: [] }, { status: 200 });
    }

    const Stripe = (await import("stripe")).default as any;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2024-06-20" });

    const list = await stripe.paymentMethodConfigurations.list({ limit: 100 });
    const cfg = list?.data?.find((c: any) => c.is_default) ?? list?.data?.[0];
    if (!cfg) return NextResponse.json({ methods: [] }, { status: 200 });

    const enabled: string[] = [];
    for (const key of WHITELIST) {
      const pm = (cfg as any)[key];
      if (pm && (pm.available === true) && (pm.display_preference?.value === "on")) {
        enabled.push(key);
      }
    }

    return NextResponse.json({ methods: enabled }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ methods: [], error: message }, { status: 200 });
  }
}
