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
import { HeroCards } from "@/components/marketing/HeroCards";
import { EventSlider } from "@/components/marketing/EventSlider";

async function getProducts(): Promise<WCProduct[]> {
  try {
    // Ask the API (no-cache) for up to 4 unique random products.
    // If the API ever returns duplicates, retry multiple times and
    // fall back to non-unique random products so we always end up
    // with 4 cards rendered.
    const base = await getBaseUrl();
    const maxCards = 4;
    const maxAttempts = 8;
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

    let out = Array.from(seen.values());

    // If we still have fewer than 4 unique products, do one more
    // non-unique random fetch and use it to fill the remaining slots.
    if (out.length < maxCards) {
      const fallbackRes = await fetch(`${base}/api/products/random?per_page=${maxCards}`, {
        cache: "no-store",
        next: { revalidate: 0 },
      });
      if (fallbackRes.ok) {
        const extra = (await fallbackRes.json()) as WCProduct[];
        for (const p of extra) {
          if (!seen.has(p.id)) {
            seen.set(p.id, p);
            out.push(p);
            if (out.length >= maxCards) break;
          }
        }
        // If we still don't have enough, allow duplicates from the fallback batch
        if (out.length < maxCards && extra.length) {
          out = out.concat(extra).slice(0, maxCards);
        }
      }
    }

    return out.slice(0, maxCards);
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

async function getHeroIntro(): Promise<string | null> {
  try {
    const QUERY = /* GraphQL */ `
      query MyQuery2 {
        pageBy(pageId: 2645) {
          homepageacf {
            heroIntro
          }
        }
      }
    `;
    const data = await wpGraphQL<any>(QUERY);
    const intro = data?.pageBy?.homepageacf?.heroIntro;
    if (typeof intro === "string" && intro.trim().length > 0) {
      return intro;
    }
    return null;
  } catch {
    return null;
  }
}

async function getHeroCardImages(): Promise<string[]> {
  try {
    const QUERY = /* GraphQL */ `
      query MyQuery2 {
        pageBy(pageId: 2645) {
          homepageacf {
            heroKaarten {
              headerKaart1 { node { sourceUrl } }
              headerKaart2 { node { sourceUrl } }
              headerKaart3 { node { sourceUrl } }
              headerKaart4 { node { sourceUrl } }
            }
          }
        }
      }
    `;
    const data = await wpGraphQL<any>(QUERY);
    const hero = data?.pageBy?.homepageacf?.heroKaarten;
    if (!hero) return [];
    const urls = [
      hero?.headerKaart1?.node?.sourceUrl,
      hero?.headerKaart2?.node?.sourceUrl,
      hero?.headerKaart3?.node?.sourceUrl,
      hero?.headerKaart4?.node?.sourceUrl,
    ].filter((u): u is string => typeof u === "string" && u.trim().length > 0);
    return urls;
  } catch {
    return [];
  }
}

async function getEventSliderImages(): Promise<string[]> {
  try {
    const QUERY = /* GraphQL */ `
      query EventSliderImages {
        pageBy(pageId: 2645) {
          homepageacf {
            eventSlider {
              slide1 {
                node {
                  sourceUrl
                }
              }
              slide2 {
                node {
                  sourceUrl
                }
              }
              slide3 {
                node {
                  sourceUrl
                }
              }
            }
          }
        }
      }
    `;
    const data = await wpGraphQL<any>(QUERY);
    const eventSlider = data?.pageBy?.homepageacf?.eventSlider;
    if (!eventSlider) return [];
    const urls = [
      eventSlider?.slide1?.node?.sourceUrl,
      eventSlider?.slide2?.node?.sourceUrl,
      eventSlider?.slide3?.node?.sourceUrl,
    ].filter((u): u is string => typeof u === "string" && u.trim().length > 0);
    return urls;
  } catch {
    return [];
  }
}

export const revalidate = 300;

export default async function HomePage() {
  const [products, events, newArrivals, onSale, collections, countdown, heroCardImages, heroIntro, eventSliderImages] = await Promise.all([
    getProducts(),
    getEvents(),
    getNewArrivals(),
    getOnSale(),
    getWPCollections(),
    getCountdownConfig(),
    getHeroCardImages(),
    getHeroIntro(),
    getEventSliderImages(),
  ]);

  const countdownEnd = countdown.end ?? undefined;
  const introHtml = (heroIntro && heroIntro.trim().length > 0)
    ? heroIntro
    : "V-dubscards is a family-owned shop for serious collectors and new fans alike.";

  // Determine if countdown should effectively be shown:
  // status must be true, there must be an end date, and end must be in the future.
  // WordPress stores the datetime in NL-time (Europe/Amsterdam). When parsing on a
  // UTC server we end up one hour late, so we subtract that offset here.
  const rawEndMs = countdownEnd ? new Date(countdownEnd).getTime() : 0;
  const countdownEndMs = rawEndMs ? rawEndMs - 60 * 60 * 1000 : 0;
  const nowMs = Date.now();

  const countdownActive = Boolean(
    countdown.status &&
    countdownEnd &&
    Number.isFinite(countdownEndMs) &&
    countdownEndMs > nowMs
  );

  return (
    <div>
      {/* Countdown banner (60vh), shown only when enabled, directly under the header */}
      {countdownActive && countdownEnd ? (
        <CountdownBanner end={countdownEnd} ctaHref="/products" bg={countdown.background || undefined} />
      ) : null}

      {/* Full-bleed hero image (60vh). Content remains within layout container. */}
      {!countdownActive && (
      <section
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen max-w-[100vw] h-[60vh] overflow-hidden"
        aria-label="Hero"
      >
          {/* Gradient background (no image) */}
          <div className="absolute inset-0 hero-bg -z-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background -z-20" />

        {/* Animated cards between background and content */}
        <HeroCards images={heroCardImages} />

          {/* Content (always on top of cards) */}
          <div className="relative z-10 h-full">
            <div className="container h-full flex items-start md:items-center justify-center px-4 pt-0 md:pt-6">
              <div className="max-w-3xl text-center mx-auto bg-background/80 backdrop-blur-sm rounded-xl px-4 py-6 md:px-8 md:py-8 md:-mt-[150px]">
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                  One of Europe's Largest Single-Card Marketplaces
                </h1>
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
            {/* Mascot image aligned to bottom center inside layout */}
            <div className="pointer-events-none block absolute inset-x-0 -bottom-14 md:-bottom-[20px] z-20 hero-eagle">
              <div className="container flex justify-center px-4 pb-0">
                <Image
                  src="/mascot-v-eagle.png"
                  alt="V-dubscards mascot"
                  width={220}
                  height={220}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <SectionBand bgClass="bg-white" className="py-6 md:py-12">
        <div className="flex items-center gap-3">
          <h2>Recommendations</h2>
        </div>
        {products.length > 0 ? (
          <>
            <div className="px-0 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
            <div className="mt-3 md:mt-4">
              <Button asChild className="gap-1">
                <Link href="/products">View all <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Connect your WooCommerce store by setting environment variables to load featured products.
          </p>
        )}
      </SectionBand>

      {/* Collections grid from WP GraphQL */}
      <SectionBand bgClass="bg-primary/5">
        <div className="flex items-center gap-3">
          <h2>Popular Collections</h2>
        </div>
        {collections.length > 0 ? (
          <>
            {(() => {
              const targetTitles = ["WWE", "MLB", "NFL", "Soccer", "NBA"];
              const byTitle = targetTitles
                .map((t) => collections.find((c) => c.title?.toLowerCase() === t.toLowerCase()))
                .filter((c): c is WpCollection => Boolean(c));
              const curated = byTitle.length ? byTitle : collections.slice(0, 5);
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {curated.map((c) => (
                    <WpCollectionTile key={c.id} item={c} aspectClass="aspect-[4/5]" />
                  ))}
                </div>
              );
            })()}
            <div className="mt-3 md:mt-4">
              <Button asChild className="gap-1">
                <Link href="/collections">View all collections <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No collections found.</p>
        )}
      </SectionBand>

      {/* Events section under Popular Collections */}
      <SectionBand bgClass="bg-white" className="py-6 md:py-12">
        <div className="flex items-center gap-3">
          <h2>Come say hi at an event!</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5 items-stretch">
          {eventSliderImages.length > 0 ? (
            <EventSlider images={eventSliderImages} />
          ) : (
            <div className="relative w-full h-56 md:h-full overflow-hidden rounded-md bg-card shadow-sm">
              <Image
                src="/events/vdubs-events.webp"
                alt="V-dubscards Events"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={false}
              />
            </div>
          )}
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
                  <div className="flex flex-col space-y-4">
                    {top3.map((ev, idx) => {
                      const isFirst = idx === 0;
                      const isUpcoming = Number.isFinite(ev.time) && ev.time >= now;
                      return (
                        <div
                          key={ev.slug || idx}
                          className={
                            "relative px-4 md:px-5 py-5 md:py-8 rounded-md border bg-card shadow-sm transition-all hover:shadow-md" +
                            (isFirst && isUpcoming ? " border-primary bg-primary/5" : "")
                          }
                        >
                          {isFirst && isUpcoming ? (
                            <span
                              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-[10px] leading-4 uppercase font-semibold tracking-wide bg-primary text-primary-foreground px-2.5 py-0.5 rounded-md"
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
          <div className="col-span-1 md:col-start-2 md:row-start-2 place-self-start z-10 mt-3 md:mt-0">
            <Button asChild className="gap-1">
              <Link href="/events">View all events <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </SectionBand>

      {/* New Arrivals section */}
      <SectionBand bgClass="bg-muted/20">
        <div className="flex items-center gap-3">
          <h2>New arrivals</h2>
        </div>
        {newArrivals.length > 0 ? (
          <>
            <div className="px-0 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {newArrivals.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
            <div className="mt-3 md:mt-4">
              <Button asChild className="gap-1">
                <Link href="/products">View all <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No new products found.</p>
        )}
      </SectionBand>

      {/* On Sale section */}
      <SectionBand bgClass="bg-white">
        <div className="flex items-center gap-3">
          <h2>On sale</h2>
        </div>
        {onSale.length > 0 ? (
          <>
            <div className="px-0 pb-5">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {onSale.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
            <div className="mt-3 md:mt-4">
              <Button asChild className="gap-1">
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
