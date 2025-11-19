// app/checkout/success/page.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import Script from "next/script";

export default function CheckoutSuccessPage() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id") || undefined;
  const [orderId, setOrderId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();
  const fired = useRef(false);

  function popConfetti() {
    if (fired.current) return;
    try {
      const w = window as any;
      if (typeof w.confetti === "function") {
        fired.current = true;
        w.confetti({
          particleCount: 150,
          spread: 70,
          origin: { x: 0.5, y: 0.5 },
          startVelocity: 40,
          scalar: 1.2,
        });
      }
    } catch {}
  }

  useEffect(() => {
    async function complete() {
      if (!sessionId) return;
      try {
        const res = await fetch("/api/checkout/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ session_id: sessionId }),
        });
        if (!res.ok) {
          let detail: any = undefined;
          try { detail = await res.json(); } catch {}
          throw new Error(detail?.error || "Completion failed");
        }
        const data = await res.json();
        setOrderId(data?.order?.id ?? null);
        // Ensure client cache reflects empty cart
        await clearCart().catch(() => {});
        // Trigger confetti once the order is confirmed
        popConfetti();
      } catch (e: any) {
        setError(e?.message || "Failed to finalize order");
      }
    }
    complete();
  }, [sessionId]);

  return (
    <div className="space-y-4 pb-16">
      {/* Load canvas-confetti from CDN; fire once when available */}
      <Script
        src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"
        strategy="afterInteractive"
        onLoad={() => popConfetti()}
      />
      <h1>Bedankt voor je bestelling</h1>
      {sessionId ? (
        <p className="text-sm text-muted-foreground">We verwerken je betaling. Dit duurt een paar seconden…</p>
      ) : (
        <p className="text-sm text-muted-foreground">Je bestelling is geplaatst.</p>
      )}
      {orderId ? <p className="text-sm">Ordernummer: {String(orderId)}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div>
        <Link href="/">
          <Button className="rounded-none bg-black text-white hover:bg-black/90">Verder winkelen</Button>
        </Link>
      </div>
    </div>
  );
}
