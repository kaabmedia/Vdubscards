// app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { mkdir, appendFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, topic } = (await req.json()) as { email?: string; topic?: string };
    const ok = typeof email === "string" && /.+@.+\..+/.test(email.trim());
    if (!ok) return NextResponse.json({ error: "invalid_email" }, { status: 400 });

    // Optional forward to external service if configured (e.g., webhook)
    if (process.env.NEWSLETTER_WEBHOOK_URL) {
      try {
        await fetch(process.env.NEWSLETTER_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, source: "vdubscards", topic: topic || undefined, ts: Date.now() }),
        });
      } catch {}
    }

    // Local dev persistence (best‑effort): write to .data/newsletter.csv
    try {
      const dir = join(process.cwd(), ".data");
      await mkdir(dir, { recursive: true });
      const line = `${new Date().toISOString()},${email},${topic || ""}\n`;
      await appendFile(join(dir, "newsletter.csv"), line, { encoding: "utf8" });
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
