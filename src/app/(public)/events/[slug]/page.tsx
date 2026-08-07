import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Clock } from "lucide-react";
import { getEvent } from "@/services/events";
import { ApiError } from "@/lib/api";
import { formatEventDate, formatEventTime, lowestPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { TicketSelector } from "@/components/features/events/handlebook";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;

  let event;
  try {
    event = await getEvent(slug);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  const price = lowestPrice(event.ticketTypes);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative mb-8 aspect-[21/9] w-full overflow-hidden rounded-2xl bg-muted">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <Calendar className="size-14 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Badge className="mb-3">{event.category}</Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{event.title}</h1>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatEventDate(event.startDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {formatEventTime(event.startDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {event.venue}, {event.city}
            </span>
          </div>

          <div className="mt-8 space-y-3">
            <h2 className="text-lg font-semibold">About this event</h2>
            <p className="whitespace-pre-line text-muted-foreground">{event.description}</p>
          </div>

          <div className="mt-8 space-y-1 rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Venue</h2>
            <p className="text-sm text-muted-foreground">{event.venue}</p>
            <p className="text-sm text-muted-foreground">{event.address}</p>
            <p className="text-sm text-muted-foreground">{event.city}</p>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            Hosted by <span className="font-medium text-foreground">{event.organizer.name}</span>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <TicketSelector event={event} lowestPrice={price} />
          </div>
        </div>
      </div>
    </div>
  );
}