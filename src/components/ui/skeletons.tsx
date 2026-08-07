import { Skeleton } from "@/components/ui/skeleton";

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-8 w-20" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}

export function TableRowSkeleton({
  columns = 4,
}: {
  columns?: number;
}) {
  return (
    <div
      className="grid gap-4 border-b border-border py-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-5 w-full" />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="mb-6 h-6 w-48" />

        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRowSkeleton key={i} columns={4} />
          ))}
        </div>
      </div>
    </div>
  );
}