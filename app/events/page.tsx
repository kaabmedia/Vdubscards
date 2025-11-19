// app/events/page.tsx
import { getBaseUrl } from "@/lib/server-url";
import { Calendar } from "lucide-react";

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
  const sorted = [...events].sort((a, b) => {
    const da = a.startdate ? new Date(a.startdate).getTime() : 0;
    const db = b.startdate ? new Date(b.startdate).getTime() : 0;
    return db - da;
  });
  return (
    <div className="space-y-4 py-8">
      <h1>Events</h1>
      {sorted.length ? (
        <ul className="divide-y divide-border overflow-hidden bg-card shadow-soft">
          {sorted.map((ev, idx) => (
            <li key={ev.slug || idx} className="p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-medium leading-none">{ev.title}</div>
                  <div className="text-sm text-muted-foreground">{ev.location || "Location n/a"}</div>
                </div>
                <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
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
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No events found.</p>
      )}
    </div>
  );
}
