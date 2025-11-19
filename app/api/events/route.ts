// app/api/events/route.ts
import { NextResponse } from "next/server";
import { wpGraphQL } from "@/lib/wp-graphql";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // always fetch fresh from WP; caching handled by page fetch tags

type WPEventsResp = {
  events?: {
    nodes: Array<{
      title?: string | null;
      slug?: string | null;
      eventacf?: {
        location?: string | null;
        startdate?: string | null;
      } | null;
    }>;
    pageInfo?: { hasNextPage: boolean; endCursor?: string | null };
  };
};

const EVENTS_QUERY = /* GraphQL */ `
  query Events($first: Int!, $after: String) {
    events(first: $first, after: $after, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
      pageInfo { hasNextPage endCursor }
      nodes {
        eventacf { location startdate }
        title
        slug
      }
    }
  }
`;

export async function GET() {
  try {
    const first = 50;
    let after: string | null | undefined = undefined;
    const all: NonNullable<WPEventsResp["events"]>["nodes"] = [];
    for (let i = 0; i < 10; i++) {
      const data: WPEventsResp = await wpGraphQL<WPEventsResp>(EVENTS_QUERY, { first, after });
      const nodes = data?.events?.nodes ?? [];
      all.push(...nodes);
      const pi = data?.events?.pageInfo;
      if (!pi?.hasNextPage) break;
      after = pi?.endCursor ?? undefined;
    }
    const list = all
      .filter(Boolean)
      .map((n) => ({
        title: n.title ?? "",
        slug: n.slug ?? "",
        location: n.eventacf?.location ?? null,
        startdate: n.eventacf?.startdate ?? null,
      }));
    return NextResponse.json(list, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch events", detail: message }, { status: 500 });
  }
}
