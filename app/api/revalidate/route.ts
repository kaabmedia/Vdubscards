// app/api/revalidate/route.ts
import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export const runtime = "nodejs";

function verifySecret(searchParams: URLSearchParams) {
  const provided = searchParams.get("secret") || "";
  const expected = process.env.REVALIDATE_SECRET || "";
  return expected && provided && provided === expected;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (!verifySecret(searchParams)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const tag = searchParams.get("tag") || "";
  const path = searchParams.get("path") || "";
  try {
    if (tag) await revalidateTag(tag, "page");
    if (path) await revalidatePath(path, "page");
    return NextResponse.json({ ok: true, tag: tag || null, path: path || null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const { searchParams } = url;
  if (!verifySecret(searchParams)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  // Allow JSON body to pass { tag, path }
  let body: any = null;
  try { body = await req.json(); } catch {}
  const tag = (body?.tag as string) || searchParams.get("tag") || "";
  const path = (body?.path as string) || searchParams.get("path") || "";
  try {
    if (tag) await revalidateTag(tag, "page");
    if (path) await revalidatePath(path, "page");
    return NextResponse.json({ ok: true, tag: tag || null, path: path || null });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

