// components/layout/PaymentBadges.tsx
"use client";
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

// Provider via env: "activemerchant" (kleur, default) of "simple" (monochroom)
const provider = (process.env.NEXT_PUBLIC_PAYMENT_BADGES_CDN || "simple").toLowerCase();

const localIcon = (name: string) => `/payments/${name}.svg`;

function amCandidates(name: string | string[]) {
  const names = Array.isArray(name) ? name : [name];
  const out: string[] = [];
  for (const n of names) {
    out.push(
      `https://cdn.statically.io/gh/activemerchant/payment_icons/master/public/payment_icons/${n}.svg`,
      `https://cdn.jsdelivr.net/gh/activemerchant/payment_icons@latest/public/payment_icons/${n}.svg`,
      `https://raw.githubusercontent.com/activemerchant/payment_icons/master/public/payment_icons/${n}.svg`
    );
  }
  return out;
}

function siCandidates(slug: string) {
  return [
    `https://cdn.simpleicons.org/${slug}`,
    `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`,
  ];
}

function iconCandidates(method: MethodKey): { sources: string[]; alt: string }[] {
  const useAM = provider !== "simple";
  const withLocal = (name: string, remoteSources: string[], alt: string) => ({
    sources: [localIcon(name), ...remoteSources],
    alt,
  });
  const AM = (n: string | string[], alt: string) => {
    const first = Array.isArray(n) ? n[0] : n;
    return withLocal(first, amCandidates(n), alt);
  };
  const SI = (s: string, alt: string) => withLocal(s, siCandidates(s), alt);
  if (useAM) {
    switch (method) {
      case "card":
        return [AM("visa", "Visa"), AM("mastercard", "Mastercard")];
      case "ideal":
        return [AM("ideal", "iDEAL")];
      case "klarna":
        return [AM("klarna", "Klarna")];
      case "bancontact":
        return [AM("bancontact", "Bancontact")];
      case "giropay":
        return [AM("giropay", "giropay")];
      case "eps":
        return [AM("eps", "EPS")];
      case "sofort":
        return [AM("sofort", "SOFORT")];
      case "paypal":
        return [AM("paypal", "PayPal")];
      case "apple_pay":
        // Repo sometimes uses hyphen, sometimes underscore; include both
        return [AM(["apple_pay", "apple-pay"], "Apple Pay")];
      default:
        return [];
    }
  } else {
    switch (method) {
      case "card":
        return [SI("visa", "Visa"), SI("mastercard", "Mastercard")];
      case "ideal":
        return [SI("ideal", "iDEAL")];
      case "klarna":
        return [SI("klarna", "Klarna")];
      case "bancontact":
        return [SI("bancontact", "Bancontact")];
      case "giropay":
        return [SI("giropay", "giropay")];
      case "eps":
        return [SI("eps", "EPS")];
      case "sofort":
        return [SI("sofort", "SOFORT")];
      case "paypal":
        return [SI("paypal", "PayPal")];
      case "apple_pay":
        return [SI("applepay", "Apple Pay")];
      default:
        return [];
    }
  }
}

function PaymentIcon({ sources, alt }: { sources: string[]; alt: string }) {
  const [idx, setIdx] = React.useState(0);
  return (
    <img
      src={sources[idx]}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="h-5 w-auto md:h-6"
      onError={() => setIdx((i) => (i + 1 < sources.length ? i + 1 : i))}
    />
  );
}

export function PaymentBadges({ initial }: { initial?: MethodKey[] }) {
  const [methods, setMethods] = React.useState<MethodKey[]>(initial || []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payments/methods", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled && Array.isArray(data.methods) && data.methods.length) {
          setMethods(data.methods as MethodKey[]);
          return;
        }
      } catch {}
      // Fallback when Stripe key/config is missing: use env or sensible defaults
      if (!cancelled) {
        const envList = (process.env.NEXT_PUBLIC_PAYMENT_METHODS || "card,ideal,bancontact,paypal,apple_pay").split(",").map((s) => s.trim()) as MethodKey[];
        setMethods(envList);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Always show PayPal even if backend doesn't return it
  const normalized = React.useMemo(() => {
    const set = new Set<MethodKey>([...methods, "paypal"]);
    return Array.from(set);
  }, [methods]);

  const items = normalized.flatMap((m) => iconCandidates(m));

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((i, idx) => (
        <span key={idx} className="inline-flex items-center rounded bg-white px-2 py-1">
          <PaymentIcon sources={i.sources} alt={i.alt} />
        </span>
      ))}
    </div>
  );
}
