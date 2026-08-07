import { Suspense } from "react";
import { CalendarX } from "lucide-react";
import Link from "next/link";

import { getEvents } from "@/services/events";
import {
  EventCard,
  EventCardSkeleton,
} from "@/components/features/events/event-card";
import { EventFilters } from "@/components/features/events/event-filters";

interface EventsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

function buildPageHref(
  params: Record<string, string | undefined>,
  page: number
) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value);
    }
  }

  query.set("page", String(page));

  return `?${query.toString()}`;
}

async function EventsResults({ searchParams }: EventsPageProps) {
  const params = await searchParams;

  const page = params.page ? Number(params.page) : 1;

  let result;

  try {
    result = await getEvents({
      page,
      limit: 12,
      search: params.search,
      category: params.category,
      city: params.city,
      sortBy:
        (params.sortBy as
          | "date"
          | "priceAsc"
          | "priceDesc"
          | "newest") ?? "date",
    });
  } catch {
    result = {
      items: [],
      meta: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const { items, meta } = result;

  if (items.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
        <CalendarX className="mb-4 size-10 text-muted-foreground" />

        <h2 className="text-lg font-semibold">No events found</h2>

        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Try a different search term or clear your filters.
        </p>

        <Link
          href="/events"
          className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  const prevHref = buildPageHref(params, page - 1);
  const nextHref = buildPageHref(params, page + 1);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {meta.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Link
              href={prevHref}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Previous
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
              Previous
            </span>
          )}

          <span className="px-3 text-sm text-muted-foreground">
            Page {meta.page} of {meta.totalPages}
          </span>

          {page < meta.totalPages ? (
            <Link
              href={nextHref}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Next
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
              Next
            </span>
          )}
        </div>
      )}
    </>
  );
}

function EventsGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default async function EventsPage({
  searchParams,
}: EventsPageProps) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Browse events
        </h1>

        <p className="mt-2 text-muted-foreground">
          Find something worth showing up for.
        </p>
      </div>

      <EventFilters />

      <div className="mt-8">
        <Suspense fallback={<EventsGridSkeleton />}>
          <EventsResults searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}