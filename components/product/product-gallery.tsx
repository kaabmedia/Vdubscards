// components/product/product-gallery.tsx
"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

type Img = { src: string; alt?: string };

type Props = {
  images: Img[];
  soldOut?: boolean;
};

export function ProductGallery({ images, soldOut }: Props) {
  const imgs = images?.length ? images : ([] as Img[]);
  const [index, setIndex] = React.useState(0);
  const max = Math.max(imgs.length - 1, 0);

  React.useEffect(() => {
    if (index > max) setIndex(max);
  }, [max, index]);

  const prev = () => setIndex((i) => (i > 0 ? i - 1 : max));
  const next = () => setIndex((i) => (i < max ? i + 1 : 0));

  const current = imgs[index];

  return (
    <div>
      <div className="relative aspect-[4/5] bg-muted border overflow-hidden">
        {current ? (
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt || ""}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 40vw"
            className="absolute inset-0 object-cover"
          />
        ) : (
          <div className="absolute inset-0" />
        )}

        {/* Controls */}
        {imgs.length > 1 ? (
          <>
            <button
              type="button"
              aria-label="Vorige"
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center bg-black/55 text-white hover:bg-black/70"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Volgende"
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center bg-black/55 text-white hover:bg-black/70"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        ) : null}

        {/* Sold out overlay */}
        {soldOut ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="px-3 py-1 rounded-none bg-black/60 text-white text-xs uppercase tracking-wide">Sold out</span>
          </div>
        ) : null}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 ? (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
          {imgs.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              aria-label={`Ga naar afbeelding ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`relative h-16 w-16 md:h-20 md:w-20 overflow-hidden border ${
                i === index ? "ring-2 ring-black" : ""
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt || ""}
                fill
                sizes="80px"
                className="absolute inset-0 object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
