// lib/wooClient.ts
"use server";
import "server-only";

const required = (key: string) => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing environment variable: ${key}`);
  return val;
};

const getBase = () => required("WC_BASE_URL");
const getKey = () => required("WC_KEY");
const getSecret = () => required("WC_SECRET");

export async function wooFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const base = getBase();
  const url = new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : base + "/");

  const auth = Buffer.from(`${getKey()}:${getSecret()}`).toString("base64");

  const res = await fetch(url.toString(), {
    ...init,
    cache: init?.cache ?? "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Woo fetch failed (${res.status} ${res.statusText}) at ${url}: ${text}`);
  }

  const type = res.headers.get("content-type") || "";
  if (type.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return (await res.text()) as unknown as T;
}

export async function wooFetchRaw(path: string, init?: RequestInit): Promise<Response> {
  const base = getBase();
  const url = new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : base + "/");
  const auth = Buffer.from(`${getKey()}:${getSecret()}`).toString("base64");
  const res = await fetch(url.toString(), {
    ...init,
    cache: init?.cache ?? "no-store",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${auth}`,
      ...(init?.headers ?? {}),
    },
  });
  return res;
}
