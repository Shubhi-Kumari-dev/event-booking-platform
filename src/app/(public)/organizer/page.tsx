import Link from "next/link";
import { cookies } from "next/headers";
import {
  CalendarRange,
  CircleDollarSign,
  ScanLine,
  Ticket,
} from "lucide-react";
import { getOrganizerSummary } from "@/services/organizer";
import { formatEventDate, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  CONFIRMED: "default",
  PENDING: "secondary",
  CANCELLED: "destructive",
  REFUNDED: "outline",
};

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{value}</h2>
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="size-6 text-primary" />
        </div>
      </div>
    </div>
  );
}

export default async function OrganizerDashboardPage() {
  const cookieStore = await cookies();
  const summary = await getOrganizerSummary(cookieStore.toString());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organizer Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Overview of your events and revenue.</p>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Events" value={summary.totalEvents} icon={CalendarRange} />
        <StatCard title="Tickets Sold" value={summary.totalTicketsSold} icon={Ticket} />
        <StatCard
          title="Revenue"
          value={`₹${summary.totalRevenue.toLocaleString()}`}
          icon={CircleDollarSign}
        />
        <StatCard
          title="Check-in Rate"
          value={`${summary.checkInRate}%`}
          icon={ScanLine}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Recent Bookings</h2>

          {summary.recentBookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {summary.recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{booking.eventTitle}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {booking.attendeeName} · {booking.bookingReference}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={STATUS_VARIANT[booking.status] ?? "outline"}>
                      {booking.status}
                    </Badge>
                    <span className="font-mono text-sm font-semibold text-primary">
                      {formatPrice(Number(booking.totalAmount))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Events */}
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Upcoming Events</h2>

          {summary.upcomingEvents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No upcoming published events.
            </p>
          ) : (
            <div className="space-y-3">
              {summary.upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/organizer/events/${event.id}/edit`}
                  className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0 hover:text-primary"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.city}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatEventDate(event.startDate)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}