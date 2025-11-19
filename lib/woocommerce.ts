// lib/woocommerce.ts
import "server-only";

const getEnv = (key: string, optional = false) => {
  const val = process.env[key];
  if (!val && !optional) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return val as string;
};

export const buildWCURL = (path: string, params?: Record<string, string | number | boolean | undefined>) => {
  const base = getEnv("WOOCOMMERCE_URL");
  const ck = getEnv("WOOCOMMERCE_CONSUMER_KEY");
  const cs = getEnv("WOOCOMMERCE_CONSUMER_SECRET");

  const url = new URL(path.replace(/^\//, ""), base.endsWith("/") ? base : base + "/");
  url.searchParams.set("consumer_key", ck);
  url.searchParams.set("consumer_secret", cs);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }

  return url.toString();
};

export const wcFetch = async <T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, init?: RequestInit): Promise<T> => {
  const apiPath = `/wp-json/wc/v3/${endpoint.replace(/^\//, "")}`;
  const url = buildWCURL(apiPath, params);
  const res = await fetch(url, {
    ...init,
    // Do not cache WC requests by default
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WooCommerce request failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
};

export const wcFetchRaw = async (endpoint: string, params?: Record<string, string | number | boolean | undefined>, init?: RequestInit): Promise<Response> => {
  const apiPath = `/wp-json/wc/v3/${endpoint.replace(/^\//, "")}`;
  const url = buildWCURL(apiPath, params);
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    // Let caller inspect status/text if needed
    return res;
  }
  return res;
};
