import Link from "next/link";
import { ArrowRight, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/features/events/event-card";
import { getEvents } from "@/services/events";

export async function FeaturedEvents() {
  let events: Awaited<ReturnType<typeof getEvents>>["items"] = [];

  try {
    const result = await getEvents({ limit: 6, sortBy: "date" });
    events = result.items;
  } catch {
    events = [];
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Happening soon
          </h2>
          <p className="mt-2 text-muted-foreground">Freshly published, ordered by date.</p>
        </div>
        <Button
          variant="ghost"
          render={<Link href="/events" />}
          nativeButton={false}
          className="hidden sm:inline-flex"
        >
          View all
          <ArrowRight className="ml-1.5 size-4" />
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <CalendarX className="mb-3 size-10 text-muted-foreground" />
          <p className="font-medium">No events published yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Check back soon, or be the first to host one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center sm:hidden">
        <Button variant="outline" render={<Link href="/events" />} nativeButton={false}>
          View all events
          <ArrowRight className="ml-1.5 size-4" />
        </Button>
      </div>
    </section>
  );
}