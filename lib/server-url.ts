// lib/server-url.ts
import { headers } from "next/headers";

export async function getBaseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const fallback = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  if (!host) return fallback;
  return `${proto}://${host}`;
}
