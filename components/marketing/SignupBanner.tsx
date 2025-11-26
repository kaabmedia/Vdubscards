// components/marketing/SignupBanner.tsx
"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SignupBanner() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState<null | "ok" | "err">(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/.+@.+\..+/.test(email.trim())) {
      setDone("err");
      return;
    }
    setLoading(true);
    setDone(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed");
      setDone("ok");
      setEmail("");
    } catch {
      setDone("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] bg-primary text-black">
      <div className="container py-8 md:py-10">
        <div className="grid gap-6 md:grid-cols-3 md:items-center">
          <div className="md:col-span-2">
            <h2 className="text-2xl md:text-3xl font-semibold">Exclusive deals & drop announcements</h2>
            <p className="text-sm text-black/70 mt-1">Schrijf je in en hoor als eerste over nieuwe drops, restocks en exclusieve acties.</p>
          </div>
          <form onSubmit={onSubmit} className="flex gap-2 md:justify-end">
            <Input
              type="email"
              placeholder="jij@voorbeeld.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!rounded-none bg-white text-black w-full md:w-72"
            />
            <Button
              disabled={loading}
              className="rounded-none bg-black text-white hover:bg-black/90"
            >
              {loading ? "Versturen…" : "Inschrijven"}
            </Button>
          </form>
        </div>
        {done === "ok" ? (
          <p className="mt-2 text-xs text-black/70">Bedankt! Check je inbox om je inschrijving te bevestigen.</p>
        ) : done === "err" ? (
          <p className="mt-2 text-xs text-red-700">Kon niet inschrijven. Controleer je e‑mail en probeer opnieuw.</p>
        ) : null}
      </div>
    </section>
  );
}
