// components/category/category-tile.tsx
import Link from "next/link";
import type { WCCategory } from "@/lib/types";
import Image from "next/image";

export function CategoryTile({ category }: { category: WCCategory }) {
  const img = category.image?.src || null;
  const href = {
    pathname: "/products",
    query: { category: category.id },
  } as const;

  return (
    <Link href={href} className="group block overflow-hidden rounded-none border bg-card shadow-soft">
      <div className="relative aspect-[4/3] bg-muted">
        {img ? (
          <Image
            src={img}
            alt={category.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground text-sm">Geen afbeelding</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="inline-flex items-center rounded bg-white/95 px-2 py-1 text-xs font-medium text-black shadow">
            {category.name}
          </div>
        </div>
      </div>
    </Link>
  );
}
