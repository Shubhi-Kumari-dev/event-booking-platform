import { QrCode, ShieldCheck, Ticket, MapPin } from "lucide-react";
import { EVENT_CATEGORIES } from "@/lib/constants";

interface StatsSectionProps {
  totalEvents: number;
  citiesCovered: number;
}

export function StatsSection({ totalEvents, citiesCovered }: StatsSectionProps) {
  const stats = [
    { label: "Live events", value: totalEvents.toLocaleString("en-IN"), icon: Ticket },
    { label: "Categories", value: EVENT_CATEGORIES.length, icon: ShieldCheck },
    { label: "Cities covered", value: citiesCovered, icon: MapPin },
    { label: "QR check-in", value: "Built-in", icon: QrCode },
  ];

  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center">
            <stat.icon className="mb-2 size-5 text-primary" />
            <span className="font-mono text-2xl font-semibold sm:text-3xl">{stat.value}</span>
            <span className="mt-1 text-sm text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}