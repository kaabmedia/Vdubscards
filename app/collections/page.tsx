// app/collections/page.tsx
import { getBaseUrl } from "@/lib/server-url";
import { WpCollection, WpCollectionTile } from "@/components/collection/wp-collection-tile";

export const revalidate = 600;

async function getAllCollections(): Promise<WpCollection[]> {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/collections`, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    return (await res.json()) as WpCollection[];
  } catch {
    return [];
  }
}

export default async function CollectionsIndexPage() {
  const list = await getAllCollections();
  return (
    <div className="space-y-4 py-8">
      <h1>Collections</h1>
      {list.length ? (
        <div className="-mx-4 md:mx-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {list.map((c) => (
              <WpCollectionTile key={c.id} item={c} aspectClass="aspect-[4/5]" />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No collections found.</p>
      )}
    </div>
  );
}
