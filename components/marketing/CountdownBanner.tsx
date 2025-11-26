// components/marketing/CountdownBanner.tsx
"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export function CountdownBanner({ end, ctaHref = "/products", className, bg }: { end: string | Date; ctaHref?: string; className?: string; bg?: string | null }) {
  // WordPress stores the countdown end in NL-time (Europe/Amsterdam).
  // Parsing on some environments yields a value that's 1 hour late,
  // so we subtract that offset so the client countdown matches WP.
  const baseEndMs = typeof end === "string" ? new Date(end).getTime() : new Date(end).getTime();
  const endMs = baseEndMs ? baseEndMs - 60 * 60 * 1000 : 0;
  const [now, setNow] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, endMs - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const bgStyle = bg ? { backgroundImage: `url(${bg})` } as React.CSSProperties : undefined;
  // All text in white as requested
  const textColor = "text-white";

  return (
    <section
      className={`relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] h-[60vh] bg-primary bg-cover bg-center ${textColor} ${className || ""}`}
      style={bgStyle}
    >
      {bg ? <div className="absolute inset-0 bg-black/50" /> : null}
      <div className="relative z-10 container h-full grid md:grid-cols-2 items-center gap-8 py-8">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-white">Exclusive drop incoming</h2>
          <p className={`text-sm md:text-base text-white/90 max-w-prose`}>Get notified when the new cards go live and be the first to grab them.</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <EmailOptin topic="drop-countdown" />
          </div>
        </div>
        <div className="flex w-full md:w-auto justify-center md:justify-end">
          <div className="grid w-full md:w-auto grid-cols-4 gap-2 md:gap-4">
            <div className="flex flex-col items-center min-w-[72px]">
              <div className="text-4xl md:text-5xl font-bold leading-none text-white">
                {pad(days)}
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-white">
                Days
              </div>
            </div>
            <div className="flex flex-col items-center min-w-[72px]">
              <div className="text-4xl md:text-5xl font-bold leading-none text-white">
                {pad(hours)}
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-white">
                Hours
              </div>
            </div>
            <div className="flex flex-col items-center min-w-[72px]">
              <div className="text-4xl md:text-5xl font-bold leading-none text-white">
                {pad(minutes)}
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-white">
                Minutes
              </div>
            </div>
            <div className="flex flex-col items-center min-w-[72px]">
              <div className="text-4xl md:text-5xl font-bold leading-none text-white">
                {pad(seconds)}
              </div>
              <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-white">
                Seconds
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EmailOptin({ topic }: { topic?: string }) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState<null | "ok" | "err">(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = /.+@.+\..+/.test(email.trim());
    if (!valid) {
      setDone("err");
      return;
    }
    setLoading(true);
    setDone(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, topic }),
      });
      if (!res.ok) throw new Error("failed");
      setDone("ok");
      setEmail("");
    } catch {
      setDone("err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
      <Input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="!rounded-none bg-white text-black w-full sm:w-72"
      />
      <Button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto rounded-none bg-purple-600 text-white hover:bg-purple-700"
      >
        {loading ? "Sending…" : "Notify me"}
      </Button>
      {done === "ok" ? (
        <span className="sr-only">Subscribed</span>
      ) : done === "err" ? (
        <span className="sr-only">Invalid email</span>
      ) : null}
    </form>
  );
}
