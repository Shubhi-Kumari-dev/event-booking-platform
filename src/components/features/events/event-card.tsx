"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatEventDate, lowestPrice, totalAvailable } from "@/lib/format";
import type { EventListItem } from "@/services/events";

export function EventCard({ event, index = 0 }: { event: EventListItem; index?: number }) {
  const price = lowestPrice(event.ticketTypes);
  const available = totalAvailable(event.ticketTypes);
  const soldOut = available <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index, 6) * 0.05 }}
    >
      <Link
        href={`/events/${event.slug}`}
        className="ticket-stub group relative block overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <Calendar className="size-10 text-muted-foreground" />
            </div>
          )}
          <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur-sm">
            {event.category}
          </Badge>
          {soldOut && (
            <Badge variant="destructive" className="absolute right-3 top-3">
              Sold out
            </Badge>
          )}
        </div>

        <div className="ticket-stub-divider" />

        <div className="space-y-2 p-4">
          <h3 className="line-clamp-1 font-semibold leading-tight">{event.title}</h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" />
            <span>{formatEventDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="line-clamp-1">
              {event.venue}, {event.city}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="font-mono text-sm font-semibold text-primary">
              {price > 0 ? `From ${formatPrice(price)}` : "Free"}
            </span>
            <span className="text-xs text-muted-foreground">
              {soldOut ? "No seats left" : `${available} seats left`}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}