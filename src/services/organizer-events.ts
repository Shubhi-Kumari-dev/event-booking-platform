import { apiFetch } from "@/lib/api";
import type { EventListItem } from "@/services/events";

export interface OrganizerEvent extends EventListItem {
  stats?: {
    totalCapacity: number;
    totalSold: number;
    revenue: number;
    bookingsCount: number;
  };
}

export interface OrganizerEventsResponse {
  items: OrganizerEvent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getOrganizerEvents(cookie?: string) {
  return apiFetch<OrganizerEventsResponse>(
    "/api/organizer/events",
    {
      cache: "no-store",
      headers: cookie
        ? {
            cookie,
          }
        : undefined,
    }
  );
}