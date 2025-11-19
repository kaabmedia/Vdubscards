// app/api/collections/route.ts
import { NextResponse } from "next/server";
import { wpGraphQL } from "@/lib/wp-graphql";

export const runtime = "nodejs";
export const revalidate = 600;

type WPCollectionsResp = {
  collecties: {
    nodes: Array<{
      id: string;
      title: string;
      slug: string;
      date?: string | null;
      featuredImage?: { node?: { sourceUrl?: string | null } | null } | null;
    }>;
    pageInfo?: { hasNextPage: boolean; endCursor?: string | null };
  };
};

const QUERY = /* GraphQL */ `
  query Collections($first: Int!, $after: String) {
    collecties(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        title
        slug
        date
        featuredImage { node { sourceUrl } }
      }
    }
  }
`;

export async function GET() {
  try {
    const first = 100;
    let after: string | null | undefined = undefined;
    const all: WPCollectionsResp["collecties"]["nodes"] = [];
    for (let i = 0; i < 10; i++) {
      const data: WPCollectionsResp = await wpGraphQL<WPCollectionsResp>(QUERY, { first, after });
      const nodes = data?.collecties?.nodes ?? [];
      all.push(...nodes);
      const pi = data?.collecties?.pageInfo;
      if (!pi?.hasNextPage) break;
      after = pi?.endCursor ?? undefined;
    }
    return NextResponse.json(
      all.map((n) => ({
        id: n.id,
        title: n.title,
        slug: n.slug,
        date: n.date,
        image: n.featuredImage?.node?.sourceUrl || null,
      })),
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "Failed to fetch collections", detail: message }, { status: 500 });
  }
}
