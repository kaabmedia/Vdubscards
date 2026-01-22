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

const localIcon = (name: string) => `/payments/${name}`;

function siCandidates(slug: string) {
  return [
    `https://cdn.simpleicons.org/${slug}`,
    `https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/${slug}.svg`,
  ];
}

function iconCandidates(method: MethodKey): { sources: string[]; alt: string }[] {
  const SI = (s: string, alt: string) => ({ sources: siCandidates(s), alt });
  const LOC = (filename: string, alt: string, fallbackSlug: string) => ({
    sources: [localIcon(filename), ...siCandidates(fallbackSlug)],
    alt,
  });
  switch (method) {
    case "card":
      return [SI("visa", "Visa"), SI("mastercard", "Mastercard")];
    case "ideal":
      return [LOC("ideal-logo-1024.png", "iDEAL", "ideal")];
    case "klarna":
      return [SI("klarna", "Klarna")];
    case "bancontact":
      return [LOC("Bancontact_logo.svg.png", "Bancontact", "bancontact")];
    case "giropay":
      return [SI("giropay", "giropay")];
    case "eps":
      return [LOC("eps-logo-color.png", "EPS", "eps")];
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

function PaymentIcon({ sources, alt }: { sources: string[]; alt: string }) {
  const [idx, setIdx] = React.useState(0);
  return (
    <img
      src={sources[idx]}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="h-5 w-auto md:h-6 opacity-80"
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

  // Always show PayPal even if backend doesn't return it; drop giropay/link; keep original order
  const normalized = React.useMemo(() => {
    const order = [...methods, "paypal"];
    const seen = new Set<MethodKey>();
    return order.filter((m) => {
      if (m === "giropay" || m === "link") return false;
      if (seen.has(m)) return false;
      seen.add(m);
      return true;
    });
  }, [methods]);

  const items = normalized.flatMap((m) => iconCandidates(m));

  if (!items.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((i, idx) => (
        <span key={idx} className="inline-flex min-w-[48px] items-center justify-center rounded-md bg-white px-2.5 py-1.5 border border-border/60 shadow-sm">
          <PaymentIcon sources={i.sources} alt={i.alt} />
        </span>
      ))}
    </div>
  );
}
