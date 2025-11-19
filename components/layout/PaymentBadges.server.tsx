// components/layout/PaymentBadges.server.tsx
import React from "react";

type MethodKey =
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

const provider = (process.env.NEXT_PUBLIC_PAYMENT_BADGES_CDN || "simple").toLowerCase();
const amBase = "https://cdn.jsdelivr.net/gh/activemerchant/payment_icons@latest/public/payment_icons/";
const siBase = "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/";

function iconFor(method: MethodKey): { src: string; alt: string }[] {
  const useAM = provider !== "simple";
  const pick = (amName: string, siName: string, alt: string) => ({ src: (useAM ? amBase + amName + ".svg" : siBase + siName + ".svg"), alt });
  switch (method) {
    case "card":
      return [pick("visa", "visa", "Visa"), pick("mastercard", "mastercard", "Mastercard")];
    case "ideal":
      return [pick("ideal", "ideal", "iDEAL")];
    case "klarna":
      return [pick("klarna", "klarna", "Klarna")];
    case "bancontact":
      return [pick("bancontact", "bancontact", "Bancontact")];
    case "giropay":
      return [pick("giropay", "giropay", "giropay")];
    case "eps":
      return [pick("eps", "eps", "EPS")];
    case "sofort":
      return [pick("sofort", "sofort", "SOFORT")];
    case "paypal":
      return [pick("paypal", "paypal", "PayPal")];
    case "apple_pay":
      return [pick("apple-pay", "applepay", "Apple Pay")];
    default:
      return [];
  }
}

export function PaymentBadgesServer() {
  const initial: MethodKey[] = (process.env.NEXT_PUBLIC_PAYMENT_METHODS || "card,ideal,bancontact,paypal,apple_pay")
    .split(",")
    .map((s) => s.trim()) as MethodKey[];

  const items = initial.flatMap((m) => iconFor(m));
  if (!items.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((i, idx) => (
        <span key={idx} className="inline-flex items-center rounded bg-white px-2 py-1">
          {/* plain img so no Next image config required */}
          <img src={i.src} alt={i.alt} loading="lazy" decoding="async" className="h-4 w-auto" />
        </span>
      ))}
    </div>
  );
}
