// app/events/page.tsx
import { getBaseUrl } from "@/lib/server-url";
import { Calendar, MapPin } from "lucide-react";

export const revalidate = 600;

type EventItem = {
  title: string;
  slug: string;
  location: string | null;
  startdate: string | null;
};

async function getAllEvents(): Promise<EventItem[]> {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}/api/events`, { next: { revalidate: 600, tags: ["events"] } });
    if (!res.ok) return [];
    return (await res.json()) as EventItem[];
  } catch {
    return [];
  }
}

export default async function EventsIndexPage() {
  const events = await getAllEvents();
  const now = Date.now();

  const withTime = events.map((e) => ({
    ...e,
    time: e.startdate ? new Date(e.startdate).getTime() : Number.POSITIVE_INFINITY,
  }));

  const upcoming = withTime
    .filter((e) => e.time >= now)
    .sort((a, b) => a.time - b.time);

  const past = withTime
    .filter((e) => e.time < now && Number.isFinite(e.time))
    .sort((a, b) => b.time - a.time);

  return (
    <div className="space-y-8">
      <div>
        <h1>Events</h1>
        <p className="text-muted-foreground mt-2">Come say hi at one of our upcoming events!</p>
      </div>

      {upcoming.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((ev, idx) => {
              const isNext = idx === 0;
              return (
                <div
                  key={ev.slug || idx}
                  className={
                    "relative p-5 rounded-md border bg-card shadow-sm transition-all hover:shadow-md" +
                    (isNext ? " border-primary bg-primary/5" : "")
                  }
                >
                  {isNext && (
                    <span className="absolute left-4 top-0 -translate-y-1/2 text-[10px] leading-4 uppercase font-semibold tracking-wide bg-primary text-primary-foreground px-2.5 py-0.5 rounded-md">
                      Next up
                    </span>
                  )}
                  <div className="space-y-3">
                    <div className="text-lg font-semibold leading-snug">{ev.title}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{ev.location || "Location TBA"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>
                        {ev.startdate
                          ? new Date(ev.startdate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Date TBA"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">Past Events</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {past.map((ev, idx) => (
              <div
                key={ev.slug || idx}
                className="p-4 rounded-md border bg-muted/30 text-muted-foreground"
              >
                <div className="space-y-2">
                  <div className="font-medium">{ev.title}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{ev.location || "Location n/a"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {ev.startdate
                        ? new Date(ev.startdate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Date n/a"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcoming.length === 0 && past.length === 0 && (
        <p className="text-sm text-muted-foreground">No events found.</p>
      )}
    </div>
  );
}
