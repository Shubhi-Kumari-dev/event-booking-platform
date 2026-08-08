import Link from "next/link";
import { cookies } from "next/headers";
import { Calendar, MapPin, PlusCircle, Pencil, ScanLine } from "lucide-react";
import { getOrganizerEvents } from "@/services/organizer-events";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/format";
import { DeleteEventButton } from "@/components/features/organizer/delete-event-button";

export default async function OrganizerEventsPage() {
  const cookieStore = await cookies();
  const response = await getOrganizerEvents(cookieStore.toString());
  const events = response.items;

  if (events.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No events yet"
        description="Create your first event."
        action={
          <Button render={<Link href="/organizer/events/new" />} nativeButton={false}>
            Create Event
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Events</h1>
          <p className="text-muted-foreground">Manage all your events.</p>
        </div>
        <Button render={<Link href="/organizer/events/new" />} nativeButton={false}>
          <PlusCircle className="mr-2 size-4" />
          Create Event
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {events.map((event) => (
          <div key={event.id} className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">{event.title}</h2>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                {formatEventDate(event.startDate)}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                {event.city}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/events/${event.slug}`} />}
                nativeButton={false}
              >
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/organizer/events/${event.id}/edit`} />}
                nativeButton={false}
              >
                <Pencil className="mr-1.5 size-3.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                render={<Link href={`/organizer/check-in/${event.id}`} />}
                nativeButton={false}
              >
                <ScanLine className="mr-1.5 size-3.5" />
                Check-in
              </Button>
              <Button
                size="sm"
                render={<Link href={`/organizer/events/${event.id}/stats`} />}
                nativeButton={false}
              >
                Analytics
              </Button>
              <DeleteEventButton eventId={event.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}