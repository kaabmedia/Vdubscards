// lib/wp-graphql.ts
import "server-only";

export type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

export function getWPGraphQLEndpoint() {
  const direct = process.env.WP_GRAPHQL_ENDPOINT;
  if (direct) return direct;
  const base = process.env.WOOCOMMERCE_URL || process.env.WC_BASE_URL || "";
  if (!base) throw new Error("Missing WP_GRAPHQL_ENDPOINT or WOOCOMMERCE_URL/WC_BASE_URL env var");
  const url = new URL("graphql", base.endsWith("/") ? base : base + "/");
  return url.toString();
}

export async function wpGraphQL<T>(query: string, variables?: Record<string, any>): Promise<T> {
  const endpoint = getWPGraphQLEndpoint();
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    // GraphQL responses can be cached by route if desired
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GraphQL request failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  return json.data as T;
}

