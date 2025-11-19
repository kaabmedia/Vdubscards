// lib/auth-cookies.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const AUTH_COOKIE = "wp_jwt";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const SECURE_COOKIE = process.env.NODE_ENV === "production";

export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: SECURE_COOKIE,
    path: "/",
    maxAge: AUTH_MAX_AGE,
  });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set({ name: AUTH_COOKIE, value: "", path: "/", httpOnly: true, sameSite: "lax", secure: true, maxAge: 0 });
}

export function getAuthToken(): string | null {
  try {
    const jar = cookies();
    return jar.get(AUTH_COOKIE)?.value || null;
  } catch {
    return null;
  }
}
