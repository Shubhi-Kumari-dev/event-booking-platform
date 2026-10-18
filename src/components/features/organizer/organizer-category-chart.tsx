"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface CategoryStat {
  category: string;
  revenue: number;
  ticketsSold: number;
}

interface OrganizerCategoryChartProps {
  data?: CategoryStat[];
}

export function OrganizerCategoryChart({ data }: OrganizerCategoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        No sales data available yet to display chart.
      </div>
    );
  }

  const chartData = data.slice(0, 8).map((item) => ({
    name: item.category,
    Revenue: item.revenue,
    "Tickets Sold": item.ticketsSold,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Revenue by Category</h2>
          <p className="text-xs text-muted-foreground">
            Ticket sales breakdown across your published event categories
          </p>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "currentColor", opacity: 0.7 }}
              angle={-20}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "currentColor", opacity: 0.7 }}
              tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                borderColor: "hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(value, name) => [
                name === "Revenue" ? `₹${Number(value).toLocaleString("en-IN")}` : value,
                name,
              ]}
            />
            <Bar
              dataKey="Revenue"
              fill="hsl(var(--primary))"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
