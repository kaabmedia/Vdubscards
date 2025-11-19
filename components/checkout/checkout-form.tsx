// components/checkout/checkout-form.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";

export function CheckoutForm() {
  const { data } = useCart();
  const count = data?.items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0;
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState<string>((process.env.NEXT_PUBLIC_DEFAULT_COUNTRY as string) || "NL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provider = process.env.NEXT_PUBLIC_CHECKOUT_PROVIDER || "cod";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          address1,
          address2,
          city,
          postcode,
          country,
          provider,
        }),
      });
      if (!res.ok) {
        let detail: any = undefined;
        try { detail = await res.json(); } catch {}
        throw new Error(detail?.error || "Checkout failed");
      }
      const data = await res.json();
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl as string;
        return;
      }
      throw new Error("No redirect from checkout");
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-6" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-medium">E‑mail</label>
        <Input className="!rounded-none" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Voornaam</label>
          <Input className="!rounded-none" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Achternaam</label>
          <Input className="!rounded-none" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Straat en huisnummer</label>
        <Input className="!rounded-none" value={address1} onChange={(e) => setAddress1(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Adresregel 2 (optioneel)</label>
        <Input className="!rounded-none" value={address2} onChange={(e) => setAddress2(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">Postcode</label>
          <Input className="!rounded-none" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">Plaats</label>
          <Input className="!rounded-none" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-2">
        <label className="text-sm font-medium">Land</label>
        <select
          className="flex h-10 w-full !rounded-none border border-input bg-transparent px-3 text-sm"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          {(process.env.NEXT_PUBLIC_ALLOWED_COUNTRIES || "NL,BE,DE").split(",").map((c) => {
            const code = c.trim();
            return (
              <option key={code} value={code}>
                {code}
              </option>
            );
          })}
        </select>
      </div>
      {/* Removed cart/provider meta row for cleaner checkout */}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div>
        <Button disabled={loading || count === 0} className="rounded-none bg-black text-white hover:bg-black/90">
          {loading ? "Bezig met afrekenen…" : provider === "stripe" ? "Betaal met Stripe" : "Bestelling plaatsen"}
        </Button>
      </div>
    </form>
  );
}
