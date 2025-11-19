// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { wcFetch } from "@/lib/woocommerce";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      firstName?: string;
      lastName?: string;
      username?: string;
    };
    const { email, password, firstName, lastName } = body;
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const payload: any = {
      email,
      password,
      username: body.username || email,
      first_name: firstName || "",
      last_name: lastName || "",
    };

    const created = await wcFetch<any>("customers", payload, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) } as any);
    return NextResponse.json({ id: created?.id, email: created?.email, username: created?.username }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

