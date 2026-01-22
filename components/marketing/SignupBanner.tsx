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
            <p className="text-sm text-black/70 mt-1">Sign up and be the first to hear about new drops, restocks and exclusive deals.</p>
          </div>
          <form onSubmit={onSubmit} className="flex gap-2 md:justify-end">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md bg-white text-foreground w-full md:w-72"
            />
            <Button
              disabled={loading}
              variant="secondary"
            >
              {loading ? "Sending…" : "Subscribe"}
            </Button>
          </form>
        </div>
        {done === "ok" ? (
          <p className="mt-2 text-xs text-primary-foreground/70">Thanks! Check your inbox to confirm your subscription.</p>
        ) : done === "err" ? (
          <p className="mt-2 text-xs text-destructive">Could not subscribe. Please check your email and try again.</p>
        ) : null}
      </div>
    </section>
  );
}
