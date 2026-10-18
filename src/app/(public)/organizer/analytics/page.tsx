import { cookies } from "next/headers";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Ticket,
  Users,
  CheckCircle2,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { getOrganizerSummary } from "@/services/organizer";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function OrganizerAnalyticsPage() {
  const cookieStore = await cookies();
  const summary = await getOrganizerSummary(cookieStore.toString()).catch(() => ({
    totalEvents: 0,
    publishedEvents: 0,
    totalRevenue: 0,
    totalTicketsSold: 0,
    totalBookings: 0,
    checkInRate: 0,
    ticketsCheckedIn: 0,
    totalTicketsIssued: 0,
    recentBookings: [],
    upcomingEvents: [],
    revenueByCategory: [],
  }));

  const maxCategoryRevenue = Math.max(
    ...(summary.revenueByCategory?.map((c) => c.revenue) ?? [1]),
    1
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comprehensive revenue trends, attendee conversion, and event check-in metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/organizer/events" />}
            nativeButton={false}
          >
            Manage Events
          </Button>
          <Button
            size="sm"
            render={<Link href="/organizer/events/new" />}
            nativeButton={false}
          >
            Create Event
          </Button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <span className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {formatCurrency(summary.totalRevenue)}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              From {summary.totalBookings} total completed orders
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Tickets Sold</span>
            <span className="rounded-lg bg-primary/10 p-2 text-primary">
              <Ticket className="size-4" />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold tracking-tight">
              {summary.totalTicketsSold.toLocaleString()}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {summary.totalEvents} organized events
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Check-in Rate</span>
            <span className="rounded-lg bg-blue-500/10 p-2 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold tracking-tight">{summary.checkInRate}%</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.ticketsCheckedIn} / {summary.totalTicketsIssued} scanned at door
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Events</span>
            <span className="rounded-lg bg-purple-500/10 p-2 text-purple-600 dark:text-purple-400">
              <Calendar className="size-4" />
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-extrabold tracking-tight">{summary.publishedEvents}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {summary.totalEvents - summary.publishedEvents} draft or unlisted
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown & Check-in Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Performance */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="font-bold">Revenue by Category</h2>
              <p className="text-xs text-muted-foreground">
                Distribution of sales across event genres.
              </p>
            </div>
            <BarChart3 className="size-5 text-muted-foreground" />
          </div>

          <div className="mt-6 space-y-5">
            {(!summary.revenueByCategory || summary.revenueByCategory.length === 0) ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No revenue recorded across categories yet.
              </p>
            ) : (
              summary.revenueByCategory.map((cat) => {
                const percentage = Math.round((cat.revenue / maxCategoryRevenue) * 100);
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{cat.category}</span>
                      <div className="text-right">
                        <span className="font-semibold">{formatCurrency(cat.revenue)}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({cat.ticketsSold} tickets)
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Door Check-in & Gate Operations */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="font-bold">Venue Check-in Health</h2>
              <p className="text-xs text-muted-foreground">
                Real-time QR verification status at venue gates.
              </p>
            </div>
            <CheckCircle2 className="size-5 text-emerald-500" />
          </div>

          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-5xl font-extrabold text-primary">{summary.checkInRate}%</div>
                <p className="mt-2 text-sm font-semibold">Overall Attendance Rate</p>
                <p className="text-xs text-muted-foreground">
                  {summary.ticketsCheckedIn} attendees verified and admitted
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-xl border border-border/60 bg-muted/30 p-4 text-center">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Admitted (Used)</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {summary.ticketsCheckedIn}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Pending Arrival</p>
                <p className="mt-1 text-2xl font-bold text-muted-foreground">
                  {Math.max(0, summary.totalTicketsIssued - summary.ticketsCheckedIn)}
                </p>
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/organizer/events" />}
                nativeButton={false}
                className="w-full"
              >
                Launch QR Scanner for Any Event
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Feed */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <h2 className="font-bold">Recent Ticket Orders</h2>
            <p className="text-xs text-muted-foreground">
              Live transaction stream from registered attendees.
            </p>
          </div>
          <Users className="size-5 text-muted-foreground" />
        </div>

        {summary.recentBookings.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No booking transactions recorded yet.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-border/60">
            {summary.recentBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-sm">{b.eventTitle}</p>
                    <span className="font-mono text-xs text-muted-foreground">
                      #{b.bookingReference}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {b.attendeeName} ({b.attendeeEmail ?? "Attendee"}) • {b.ticketTypeName ?? "Ticket"} × {b.quantity ?? 1}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                  <div>
                    <p className="font-bold text-sm text-primary">
                      {formatCurrency(Number(b.totalAmount))}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(b.createdAt)}</p>
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
