// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setAuthCookie } from "@/lib/auth-cookies";
import { getWPGraphQLEndpoint } from "@/lib/wp-graphql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getJwtEndpoint() {
  const ep = process.env.WP_JWT_ENDPOINT;
  if (ep) return ep;
  const base = process.env.WOOCOMMERCE_URL || process.env.WC_BASE_URL || "";
  if (!base) throw new Error("WP_JWT_ENDPOINT or WOOCOMMERCE_URL missing");
  const u = new URL("wp-json/jwt-auth/v1/token", base.endsWith("/") ? base : base + "/");
  return u.toString();
}

function getSimpleJwtEndpoint() {
  const base = process.env.WOOCOMMERCE_URL || process.env.WC_BASE_URL || "";
  if (!base) throw new Error("WOOCOMMERCE_URL missing");
  const u = new URL("", base.endsWith("/") ? base : base + "/");
  u.searchParams.set("rest_route", "/simple-jwt-login/v1/auth");
  return u.toString();
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json()) as { username?: string; password?: string };
    if (!username || !password) return NextResponse.json({ error: "Missing credentials" }, { status: 400 });

    // Force Simple JWT Login flow
    const url = new URL(getSimpleJwtEndpoint());
    url.searchParams.set("login", username);
    if (username.includes("@")) url.searchParams.set("email", username);
    else url.searchParams.set("username", username);
    url.searchParams.set("password", password);
    const authParam = process.env.WP_SIMPLE_JWT_AUTH_PARAM || "AUTH_KEY";
    if (process.env.WP_SIMPLE_JWT_AUTH_CODE) url.searchParams.set(authParam, process.env.WP_SIMPLE_JWT_AUTH_CODE);
    // Try combinations: POST rest_route, GET rest_route, GET/POST wp-json
    const attempts: { url: URL; method: 'GET' | 'POST' }[] = [];
    attempts.push({ url, method: 'POST' });
    attempts.push({ url, method: 'GET' });
    const base = process.env.WOOCOMMERCE_URL || process.env.WC_BASE_URL || "";
    const wpjson = new URL("wp-json/simple-jwt-login/v1/auth", base.endsWith("/") ? base : base + "/");
    // copy params to wpjson
    url.searchParams.forEach((v, k) => wpjson.searchParams.set(k, v));
    attempts.push({ url: wpjson, method: 'GET' });
    attempts.push({ url: wpjson, method: 'POST' });

    let lastErr: any = null;
    for (const a of attempts) {
      try {
        const res = await fetch(a.url.toString(), { method: a.method, headers: { Accept: 'application/json' } });
        const data: any = await res.json().catch(() => ({}));
        const tok = data?.data?.jwt || data?.jwt || data?.token;
        if ((res.ok || data?.success === true) && tok) {
          const out = NextResponse.json({ user: { username } }, { status: 200 });
          setAuthCookie(out, tok);
          return out;
        }
        lastErr = data?.message || data?.code || `HTTP ${res.status}`;
      } catch (e: any) {
        lastErr = e?.message || 'request failed';
      }
    }
    // If all attempts failed, return the last error
    return NextResponse.json({ error: lastErr || 'Login failed' }, { status: 401 });

    // 1) Try WPGraphQL JWT Authentication first (dead code when returning above)
    try {
      const gql = getWPGraphQLEndpoint();
      const LOGIN_MUTATION = `mutation Login($username: String!, $password: String!) {
        login(input: { username: $username, password: $password }) {
          authToken
          user { id username name }
        }
      }`;
      const gres = await fetch(gql, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: LOGIN_MUTATION, variables: { username, password } }),
      });
      const gdata: any = await gres.json().catch(() => ({}));
      const token = gdata?.data?.login?.authToken as string | undefined;
      if (gres.ok && token) {
        const out = NextResponse.json(
          { user: { username: gdata?.data?.login?.user?.username || username } },
          { status: 200 }
        );
        setAuthCookie(out, token);
        return out;
      }
    } catch {}

    // 2) Fallback to REST JWT endpoint if available
    try {
      const res = await fetch(getJwtEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => null as any);
      if (!res.ok || !data?.token) {
        throw new Error(data?.message || data?.error || "Invalid credentials");
      }
      const out = NextResponse.json(
        { user: { username: data.user_nicename, email: data.user_email, name: data.user_display_name } },
        { status: 200 }
      );
      setAuthCookie(out, data.token as string);
      return out;
    } catch {}

    // 3) Fallback to Simple JWT Login plugin endpoint
    try {
      const url = new URL(getSimpleJwtEndpoint());
      url.searchParams.set("login", username);
      url.searchParams.set("password", password);
      const sres = await fetch(url.toString(), { method: "POST" });
      const sdata: any = await sres.json().catch(() => ({}));
      const token = sdata?.data?.jwt || sdata?.jwt || sdata?.token;
      if (sres.ok && token) {
        const out = NextResponse.json({ user: { username } }, { status: 200 });
        setAuthCookie(out, token);
        return out;
      }
      return NextResponse.json({ error: sdata?.message || "Login failed" }, { status: 401 });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || "Login failed" }, { status: 500 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
