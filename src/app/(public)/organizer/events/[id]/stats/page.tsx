import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  IndianRupee,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type StatsResponse = {
  event: {
    id: string;
    title: string;
    status: string;
    startDate: string;
  };
  stats: {
    totalCapacity: number;
    totalSold: number;
    totalRemaining: number;
    revenue: number;
    checkedIn: number;
    checkInRate: number;
    salesByTicketType: {
      name: string;
      quantity: number;
      quantitySold: number;
      revenue: number;
    }[];
  };
  attendees: {
    bookingId: string;
    bookingReference: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
    ticketType: string;
    quantity: number;
    totalAmount: number;
    checkedInCount: number;
    createdAt: string;
  }[];
};

type EventStatsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EventStatsPage({
  params,
}: EventStatsPageProps) {
  const { id } = await params;

  const cookieStore = await cookies();

  const data = await apiFetch<StatsResponse>(
    `/api/organizer/events/${id}/stats`,
    {
      cache: "no-store",
      headers: {
        cookie: cookieStore.toString(),
      },
    }
  );

  const { event, stats } = data;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Button
        variant="outline"
        render={<Link href="/organizer/events" />}
        nativeButton={false}
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to Events
      </Button>

      <div className="mb-8 mt-8">
        <p className="text-sm text-muted-foreground">
          Event Analytics
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {event.title}
        </h1>

        <p className="mt-2 text-muted-foreground">
          View performance and booking statistics for your event.
        </p>
      </div>

      {/* Event information */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">
          Event Information
        </h2>

        <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            {new Date(event.startDate).toLocaleDateString()}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            Status: {event.status}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Tickets Sold
          </p>

          <p className="mt-3 text-3xl font-bold">
            {stats.totalSold}
          </p>

          <Ticket className="mt-4 size-5" />
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Total Bookings
          </p>

          <p className="mt-3 text-3xl font-bold">
            {data.attendees.length}
          </p>

          <Calendar className="mt-4 size-5" />
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Revenue
          </p>

          <p className="mt-3 text-3xl font-bold">
            ₹{stats.revenue.toLocaleString("en-IN")}
          </p>

          <IndianRupee className="mt-4 size-5" />
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Capacity
          </p>

          <p className="mt-3 text-3xl font-bold">
            {stats.totalCapacity}
          </p>

          <MapPin className="mt-4 size-5" />
        </div>
      </div>

      {/* Remaining + Check-in */}
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Tickets Remaining
          </p>

          <p className="mt-2 text-2xl font-bold">
            {stats.totalRemaining}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Checked In
          </p>

          <p className="mt-2 text-2xl font-bold">
            {stats.checkedIn}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Check-in Rate
          </p>

          <p className="mt-2 text-2xl font-bold">
            {(stats.checkInRate * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Ticket Sales */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">
          Ticket Sales
        </h2>

        <div className="mt-5 space-y-4">
          {stats.salesByTicketType.map((ticket) => (
            <div
              key={ticket.name}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-medium">
                  {ticket.name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {ticket.quantitySold} / {ticket.quantity} sold
                </p>
              </div>

              <p className="font-semibold">
                ₹{ticket.revenue.toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Overview */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">
          Booking Overview
        </h2>

        {data.attendees.length === 0 ? (
          <p className="mt-2 text-muted-foreground">
            No confirmed bookings yet.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {data.attendees.map((booking) => (
              <div
                key={booking.bookingId}
                className="rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {booking.user.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {booking.user.email}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">
                      {booking.ticketType}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {booking.quantity} ticket(s)
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}