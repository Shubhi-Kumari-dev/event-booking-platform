import Link from "next/link";
import { cookies } from "next/headers";
export const dynamic = "force-dynamic";
import {
  CalendarX,
  Calendar,
  MapPin,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

import {
  getMyBookings,
  type BookingListItem,
} from "@/services/bookings";

import {
  formatEventDate,
  formatPrice,
} from "@/lib/format";

import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  CONFIRMED: "default",
  PENDING: "secondary",
  CANCELLED: "destructive",
  REFUNDED: "outline",
};

interface DashboardPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const isForbidden = params?.error === "forbidden";
  let bookings: BookingListItem[] = [];

  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    bookings = await getMyBookings(cookieHeader);
  } catch (error) {
    console.error("Failed to load bookings:", error);
    bookings = [];
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      {isForbidden && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Organizer Access Restricted</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                You attempted to access an Organizer tool, but you are signed in as an <strong>Attendee</strong>. Event creation, analytics, and QR check-in require an Organizer account.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition"
                >
                  Switch to Organizer (organizer@demo.com)
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold text-foreground underline underline-offset-4"
                >
                  Create New Organizer Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          My Bookings
        </h1>

        <p className="mt-1 text-muted-foreground">
          View your event bookings and tickets.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-16 text-center">
          <CalendarX className="mb-4 size-10 text-muted-foreground" />

          <h2 className="font-semibold">
            No bookings yet
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Your bookings will appear here.
          </p>

          <Link
            href="/events"
            className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/dashboard/bookings/${booking.id}`}
              className="block rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">
                    {booking.event.title}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      {formatEventDate(
                        booking.event.startDate
                      )}
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {booking.event.venue}
                    </span>
                  </div>

                  <p className="mt-3 font-mono text-xs text-muted-foreground">
                    {booking.bookingReference}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Badge
                    variant={
                      STATUS_VARIANT[booking.status] ??
                      "outline"
                    }
                  >
                    {booking.status}
                  </Badge>

                  <span className="font-mono font-semibold text-primary">
                    {formatPrice(booking.totalAmount)}
                  </span>

                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}