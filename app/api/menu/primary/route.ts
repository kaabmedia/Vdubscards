// app/api/menu/primary/route.ts
import { NextResponse } from "next/server";
import { wpGraphQL } from "@/lib/wp-graphql";

export const runtime = "nodejs";

type WPMenuResp = {
  menuItems: {
    nodes: Array<{
      id: string;
      databaseId: number;
      label: string;
      path: string;
      childItems?: { nodes?: Array<{
        id: string;
        databaseId: number;
        label: string;
        path: string;
        childItems?: { nodes?: Array<{
          id: string;
          databaseId: number;
          label: string;
          path: string;
        }> };
      }> };
    }>;
  };
};

const QUERY = /* GraphQL */ `
  query GetPrimaryMenu {
    menuItems(where: { location: PRIMARY, parentDatabaseId: 0 }, first: 100) {
      nodes {
        id
        databaseId
        label
        path
        childItems(first: 100) {
          nodes {
            id
            databaseId
            label
            path
            childItems(first: 100) {
              nodes {
                id
                databaseId
                label
                path
              }
            }
          }
        }
      }
    }
  }
`;

function getWpHost(): string | null {
  const base = process.env.WOOCOMMERCE_URL || process.env.WC_BASE_URL || "";
  try {
    if (!base) return null;
    const u = new URL(base);
    return u.host;
  } catch {
    return null;
  }
}

function toInternalPath(path: string): string {
  const wpHost = getWpHost();
  try {
    const u = new URL(path);
    // Only strip to pathname if it points to our WP host; otherwise keep full URL
    if (wpHost && u.host === wpHost) {
      path = u.pathname || "/";
    } else {
      return path;
    }
  } catch {
    // not absolute
    if (!path.startsWith("/")) path = "/" + path;
  }
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

type NavItem = {
  id: number;
  label: string;
  path: string;
  children?: NavItem[];
};

function mapNode(n: any): NavItem {
  const children = (n?.childItems?.nodes || []).map(mapNode);
  return {
    id: Number(n?.databaseId || 0) || Math.random(),
    label: String(n?.label || ""),
    path: toInternalPath(String(n?.path || "/")),
    children: children.length ? children : undefined,
  };
}

export async function GET() {
  try {
    const data = await wpGraphQL<WPMenuResp>(QUERY);
    const nodes = data?.menuItems?.nodes || [];
    const items = nodes.map(mapNode).filter((n) => n.label && n.path);
    return NextResponse.json({ items }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
