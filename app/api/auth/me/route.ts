// app/api/auth/me/route.ts
import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/auth-cookies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSimpleJwtValidateEndpoint() {
  const direct = process.env.WP_SIMPLE_JWT_VALIDATE;
  if (direct) return direct;
  const base = process.env.WOOCOMMERCE_URL || process.env.WC_BASE_URL || "";
  if (!base) throw new Error("WOOCOMMERCE_URL missing");
  const u = new URL("", base.endsWith("/") ? base : base + "/");
  u.searchParams.set("rest_route", "/simple-jwt-login/v1/auth/validate");
  return u.toString();
}

export async function GET(req: Request) {
  try {
    const token = await getAuthToken();
    const debug = new URL(req.url).searchParams.get("debug");
    if (!token) return NextResponse.json({ authenticated: false, reason: "no_cookie" }, { status: 200 });

    const results: any[] = [];
    const okFlags: boolean[] = [];

    const checkOk = (status: number, data: any) => {
      const lower = (x: any) => (typeof x === "string" ? x.toLowerCase() : x);
      const s = lower(data?.status) || lower(data?.data?.status);
      const valid = Boolean(
        status === 200 &&
          (data?.success === true || data?.valid === true || s === "ok" || data?.code === "jwt_valid" || data?.data === "valid")
      );
      return valid;
    };

    // 1) rest_route with JWT param
    try {
      const vurl = new URL(getSimpleJwtValidateEndpoint());
      vurl.searchParams.set("JWT", token);
      const res = await fetch(vurl.toString(), { method: "GET" });
      const data: any = await res.json().catch(() => ({}));
      results.push({ path: vurl.pathname + vurl.search, status: res.status, data });
      okFlags.push(checkOk(res.status, data));
      if (okFlags[okFlags.length - 1]) return NextResponse.json({ authenticated: true }, { status: 200 });
    } catch {}

    // 2) rest_route with Authorization header
    try {
      const vurl = new URL(getSimpleJwtValidateEndpoint());
      const res = await fetch(vurl.toString(), { method: "GET", headers: { Authorization: `Bearer ${token}` } });
      const data: any = await res.json().catch(() => ({}));
      results.push({ path: vurl.pathname + vurl.search + " (auth header)", status: res.status, data });
      okFlags.push(checkOk(res.status, data));
      if (okFlags[okFlags.length - 1]) return NextResponse.json({ authenticated: true }, { status: 200 });
    } catch {}

    // 3) /wp-json with JWT param
    try {
      const base = process.env.WOOCOMMERCE_URL || process.env.WC_BASE_URL || "";
      const vjson = new URL("wp-json/simple-jwt-login/v1/auth/validate", base.endsWith("/") ? base : base + "/");
      vjson.searchParams.set("JWT", token);
      const res = await fetch(vjson.toString(), { method: "GET" });
      const data: any = await res.json().catch(() => ({}));
      results.push({ path: vjson.pathname + vjson.search, status: res.status, data });
      okFlags.push(checkOk(res.status, data));
      if (okFlags[okFlags.length - 1]) return NextResponse.json({ authenticated: true }, { status: 200 });
    } catch {}

    // 4) /wp-json with Authorization header
    try {
      const base = process.env.WOOCOMMERCE_URL || process.env.WC_BASE_URL || "";
      const vjson = new URL("wp-json/simple-jwt-login/v1/auth/validate", base.endsWith("/") ? base : base + "/");
      const res = await fetch(vjson.toString(), { method: "GET", headers: { Authorization: `Bearer ${token}` } });
      const data: any = await res.json().catch(() => ({}));
      results.push({ path: vjson.pathname + vjson.search + " (auth header)", status: res.status, data });
      okFlags.push(checkOk(res.status, data));
      if (okFlags[okFlags.length - 1]) return NextResponse.json({ authenticated: true }, { status: 200 });
    } catch {}

    const payload: any = { authenticated: false };
    if (debug) payload.debug = results;
    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ authenticated: false, error: e?.message || "validate failed" }, { status: 200 });
  }
}
