// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { ProductCard } from "@/components/product/product-card";
import type { WCProduct } from "@/lib/types";
import { siteConfig } from "@/config/site";
import { getBaseUrl } from "@/lib/server-url";
import { SectionBand } from "@/components/layout/SectionBand";
import { ArrowRight, Calendar } from "lucide-react";
import { WpCollection, WpCollectionTile } from "@/components/collection/wp-collection-tile";
import { Button } from "@/components/ui/button";
import { wpGraphQL } from "@/lib/wp-graphql";
import { CountdownBanner } from "@/components/marketing/CountdownBanner";

async function getProducts(): Promise<WCProduct[]> {
  try {
    // Ask the API (no-cache) for up to 4 unique random products.
    // If the API ever returns duplicates, retry a couple of times so
    // we still try to fill all 4 slots with unique cards.
    const base = await getBaseUrl();
    const maxCards = 4;
    const maxAttempts = 3;
    const seen = new Map<number, WCProduct>();

    for (let attempt = 0; attempt < maxAttempts && seen.size < maxCards; attempt++) {
      const res = await fetch(`${base}/api/products/random?per_page=${maxCards}&unique=1`, {
        cache: "no-store",
        next: { revalidate: 0 },
      });
      if (!res.ok) break;
      const batch = (await res.json()) as WCProduct[];
      for (const p of batch) {
        if (!seen.has(p.id)) {
          seen.set(p.id, p);
          if (seen.size >= maxCards) break;
        }
      }
    }

    return Array.from(seen.values()).slice(0, maxCards);
  } catch {
    return [];
  }
}

type EventItem = {
  title: string;
  slug: string;
  location: string | null;
  startdate: string | null;
};

async function getEvents(): Promise<EventItem[]> {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/events`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()) as EventItem[];
  } catch {
    return [];
  }
}

async function getNewArrivals(): Promise<WCProduct[]> {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/products?per_page=4&orderby=date`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return (await res.json()) as WCProduct[];
  } catch {
    return [];
  }
}

async function getOnSale(): Promise<WCProduct[]> {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/products?per_page=4&on_sale=true`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return (await res.json()) as WCProduct[];
  } catch {
    return [];
  }
}

async function getWPCollections(): Promise<WpCollection[]> {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/collections`, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    return (await res.json()) as WpCollection[];
  } catch {
    return [];
  }
}

async function getCountdownConfig(): Promise<{ status: boolean; end: string | null; background: string | null }> {
  // Use the provided query shape with background { node { sourceUrl } }
  try {
    const QUERY = /* GraphQL */ `
      query MyQuery2 {
        pageBy(pageId: 2645) {
          homepageacf {
            countdownStatus
            countdownEnd
            countdownBackground {
              node { sourceUrl }
            }
          }
        }
      }
    `;
    const data = await wpGraphQL<any>(QUERY);
    const status = Boolean(data?.pageBy?.homepageacf?.countdownStatus);
    const end = data?.pageBy?.homepageacf?.countdownEnd || null;
    const bg = data?.pageBy?.homepageacf?.countdownBackground?.node?.sourceUrl || null;
    return { status, end, background: bg };
  } catch {
    // Fallback without background to avoid hiding the timer entirely
    try {
      const QUERY_FALLBACK = /* GraphQL */ `
        query MyQuery2 {
          pageBy(pageId: 2645) {
            homepageacf { countdownStatus countdownEnd }
          }
        }
      `;
      const data = await wpGraphQL<any>(QUERY_FALLBACK);
      const status = Boolean(data?.pageBy?.homepageacf?.countdownStatus);
      const end = data?.pageBy?.homepageacf?.countdownEnd || null;
      return { status, end, background: null };
    } catch {
      return { status: false, end: null, background: null };
    }
  }
}

export const revalidate = 300;

export default async function HomePage() {
  const [products, events, newArrivals, onSale, collections, countdown] = await Promise.all([
    getProducts(),
    getEvents(),
    getNewArrivals(),
    getOnSale(),
    getWPCollections(),
    getCountdownConfig(),
  ]);

  return (
    <div>
      {/* Countdown banner (60vh), shown only when enabled, directly under the header */}
      {countdown.status && countdown.end ? (
        <CountdownBanner end={countdown.end} ctaHref="/products" bg={countdown.background || undefined} />
      ) : null}

      {/* Full-bleed hero image (70vh). Content remains within layout container. */}
      <section
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] h-[70svh] overflow-hidden"
        aria-label="Hero"
      >
        {/* Gradient background (no image) */}
        <div className="absolute inset-0 hero-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background" />
        <div className="relative h-full">
          <div className="container h-full flex items-center">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Premium Cards, Comics & Collectibles
              </h1>
              <p className="mt-3 text-muted-foreground">
                V-dubscards is a family-owned shop for serious collectors and new fans alike.
              </p>
              <div className="mt-6">
                <Link
                  href="/products"
                  className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-soft hover:opacity-95"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionBand bgClass="bg-white" className="py-6 md:py-12">
        <div className="flex items-center gap-3">
          <h2>Random Picks</h2>
        </div>
        {products.length > 0 ? (
          <>
            <div className="px-0 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
            <div className="mt-4">
              <Button asChild className="gap-1 rounded-full">
                <Link href="/products">Bekijk alles <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Connect your WooCommerce store by setting environment variables to load featured products.
          </p>
        )}
      </SectionBand>

      {/* Events section under Random Picks */}
      <SectionBand bgClass="bg-muted/30" className="py-6 md:py-12">
        <div className="flex items-center gap-3">
          <h2>Come say hi at an event!</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5 items-stretch">
          <div className="relative w-full h-56 md:h-full overflow-hidden bg-card shadow-soft">
            <Image
              src="/events/vdubs-events.webp"
              alt="V-dubscards Events"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
            />
          </div>
          <div className="md:col-start-2 md:row-start-1">
            <div className="flex flex-col h-full">
              {(() => {
                const now = Date.now();
                const withTime = events.map((e) => ({
                  ...e,
                  time: e.startdate ? new Date(e.startdate).getTime() : Number.POSITIVE_INFINITY,
                }));
                const upcoming = withTime
                  .filter((e) => e.time >= now)
                  .sort((a, b) => a.time - b.time);
                const past = withTime
                  .filter((e) => !Number.isFinite(e.time) || e.time < now)
                  .sort((a, b) => (b.time || 0) - (a.time || 0));
                const combined = [...upcoming, ...past];
                const top3 = combined.slice(0, 3);

                return top3.length ? (
                  <div className="flex flex-col space-y-5">
                    {top3.map((ev, idx) => {
                      const isFirst = idx === 0;
                      const isUpcoming = Number.isFinite(ev.time) && ev.time >= now;
                      return (
                        <div
                          key={ev.slug || idx}
                          className={
                            "relative px-4 md:px-5 py-5 md:py-10 bg-card shadow-soft " +
                            (isFirst ? " border-2 border-yellow-400 bg-yellow-50" : "")
                          }
                        >
                          {isFirst && isUpcoming ? (
                            <span
                              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[10px] leading-4 uppercase font-semibold tracking-wide text-yellow-900 bg-yellow-300 px-2 py-0.5 border border-yellow-400 rounded-full"
                            >
                              Next up
                            </span>
                          ) : null}
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <div className="text-base md:text-lg font-semibold leading-snug">{ev.title}</div>
                              <div className="text-sm md:text-base text-muted-foreground mt-1">
                                {ev.location || "Location n/a"}
                              </div>
                            </div>
                            <div className="text-sm md:text-base text-muted-foreground inline-flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {ev.startdate
                                  ? new Date(ev.startdate).toLocaleDateString("nl-NL", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "Date n/a"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center text-sm text-muted-foreground">No events found.</div>
                );
              })()}
            </div>
          </div>
          <div className="col-span-1 md:col-start-2 md:row-start-2 place-self-start z-10 mt-5 md:mt-0">
            <Button asChild className="gap-1 rounded-full">
              <Link href="/events">View all events <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </SectionBand>

      {/* Collections grid from WP GraphQL */}
      <SectionBand bgClass="bg-muted/30">
        <div className="flex items-center gap-3">
          <h2>Popular Collections</h2>
        </div>
        {collections.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {collections.slice(0, 5).map((c) => (
                <WpCollectionTile key={c.id} item={c} aspectClass="aspect-[4/3.2]" />
              ))}
            </div>
            <div className="mt-4">
              <Button asChild className="gap-1 rounded-full">
                <Link href="/collections">View all collections <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No collections found.</p>
        )}
      </SectionBand>

      {/* New Arrivals section */}
      <SectionBand bgClass="bg-white">
        <div className="flex items-center gap-3">
          <h2>New arrivals</h2>
        </div>
        {newArrivals.length > 0 ? (
          <>
            <div className="px-0 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {newArrivals.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
            <div className="mt-4">
              <Button asChild className="gap-1 rounded-full">
                <Link href="/products">View all <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No new products found.</p>
        )}
      </SectionBand>

      {/* On Sale section */}
      <SectionBand bgClass="bg-transparent">
        <div className="flex items-center gap-3">
          <h2>On sale</h2>
        </div>
        {onSale.length > 0 ? (
          <>
            <div className="px-0 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {onSale.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
            <div className="mt-4">
              <Button asChild className="gap-1 rounded-full">
                <Link href="/products?on_sale=1">View all <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No promotions at the moment.</p>
        )}
      </SectionBand>
    </div>
  );
}
