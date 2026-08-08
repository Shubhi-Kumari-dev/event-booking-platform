import { cookies } from "next/headers";
import {
  CalendarRange,
  CircleDollarSign,
  ShoppingBag,
  Ticket,
} from "lucide-react";

import { getOrganizerSummary } from "@/services/organizer";


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

          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            {value}
          </h2>
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
        <h1 className="text-3xl font-bold tracking-tight">
          Organizer Dashboard
        </h1>

        <p className="mt-2 text-muted-foreground">
          Overview of your events and revenue.
        </p>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Events"
          value={summary.totalEvents}
          icon={CalendarRange}
        />

        <StatCard
          title="Published Events"
          value={summary.publishedEvents}
          icon={CalendarRange}
        />

        <StatCard
          title="Tickets Sold"
          value={summary.totalTicketsSold}
          icon={Ticket}
        />

        <StatCard
          title="Revenue"
          value={`₹${summary.totalRevenue.toLocaleString()}`}
          icon={CircleDollarSign}
        />
      </section>

      <section className="rounded-xl border border-border bg-card p-8">
        <div className="flex items-center gap-3">
          <ShoppingBag className="size-6 text-primary" />

          <div>
            <h2 className="text-lg font-semibold">
              Total Bookings
            </h2>

            <p className="text-sm text-muted-foreground">
              Across all your events
            </p>
          </div>
        </div>

        <div className="mt-6 text-5xl font-bold">
          {summary.totalBookings}
        </div>
      </section>
    </div>
  );
}