"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EVENT_CATEGORIES } from "@/lib/constants";

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "date", label: "Date: soonest" },
  { value: "priceAsc", label: "Price: low to high" },
  { value: "priceDesc", label: "Price: high to low" },
  { value: "newest", label: "Newly listed" },
];

export function EventFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const activeCategory = searchParams.get("category") ?? "";
  const activeSort = searchParams.get("sortBy") ?? "date";

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: search.trim() || null });
  }

  const sortLabel = SORT_OPTIONS.find((o) => o.value === activeSort)?.label ?? "Sort";
  const hasFilters = activeCategory || searchParams.get("search");

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events, venues, or cities"
            className="pl-9"
          />
        </form>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <SlidersHorizontal className="mr-1.5 size-4" />
            {sortLabel}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => updateParams({ sortBy: opt.value })}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={activeCategory === "" ? "default" : "outline"}
          size="xs"
          onClick={() => updateParams({ category: null })}
        >
          All categories
        </Button>
        {EVENT_CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="xs"
            onClick={() => updateParams({ category: activeCategory === cat ? null : cat })}
          >
            {cat}
          </Button>
        ))}

        {hasFilters && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setSearch("");
              router.push(pathname);
            }}
            className="text-muted-foreground"
          >
            <X className="mr-1 size-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}