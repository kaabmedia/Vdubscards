// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Temporarily disable login / JWT handling for this build.
// The endpoint always responds with an error payload that the UI can handle.
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Login is temporarily disabled." },
    { status: 503 }
  );
}
