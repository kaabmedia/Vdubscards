// components/collection/wp-collection-tile.tsx
import Link from "next/link";
import Image from "next/image";

export type WpCollection = {
  id: string;
  title: string;
  slug: string;
  date?: string | null;
  image?: string | null;
};

export function WpCollectionTile({ item, aspectClass = "aspect-[4/3]" }: { item: WpCollection; aspectClass?: string }) {
  const href = `/collections/${item.slug}`;
  return (
    <Link href={href as any} className="group block overflow-hidden rounded-md border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className={`relative ${aspectClass} bg-muted`}>
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">No image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="inline-flex items-center bg-white px-2.5 py-1 text-xs font-medium text-black rounded-md shadow-sm">
            {item.title}
          </div>
        </div>
      </div>
    </Link>
  );
}
