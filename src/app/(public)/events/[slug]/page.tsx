import { notFound } from "next/navigation";
import Image from "next/image";
import { Calendar, MapPin, Clock, Mail } from "lucide-react";
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

          {/* Host & Organizer Info Card */}
          <div className="mt-8 rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Event Host
            </h3>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {event.organizer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{event.organizer.name}</p>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                      Host
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Event Organizer on Eventify</p>
                </div>
              </div>

              {event.organizer.email && (
                <a
                  href={`mailto:${event.organizer.email}?subject=Inquiry about ${encodeURIComponent(event.title)}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Mail className="size-3.5" />
                  Contact Host
                </a>
              )}
            </div>
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