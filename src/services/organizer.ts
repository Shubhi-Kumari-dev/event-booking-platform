import { apiFetch } from "@/lib/api";
import type { PaginatedResponse } from "@/types";
import type { EventListItem } from "@/services/events";

export interface OrganizerSummary {
  totalEvents: number;
  publishedEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalBookings: number;
}

export async function getOrganizerSummary(cookie?: string) {
  return apiFetch<OrganizerSummary>("/api/organizer/summary", {
    cache: "no-store",
    headers: cookie
      ? {
          cookie,
        }
      : undefined,
  });
}

export async function getOrganizerEvents(cookie?: string) {
  return apiFetch<PaginatedResponse<EventListItem>>(
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