import { apiFetch } from "@/lib/api";
import type { PaginatedResponse } from "@/types";
import type { EventListItem } from "@/services/events";

export interface RecentBooking {
  id: string;
  bookingReference: string;
  eventTitle: string;
  attendeeName: string;
  totalAmount: string;
  status: string;
  createdAt: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  startDate: string;
  city: string;
}

export interface OrganizerSummary {
  totalEvents: number;
  publishedEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  totalBookings: number;
  checkInRate: number;
  ticketsCheckedIn: number;
  totalTicketsIssued: number;
  recentBookings: RecentBooking[];
  upcomingEvents: UpcomingEvent[];
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
  return apiFetch<PaginatedResponse<EventListItem>>("/api/organizer/events", {
    cache: "no-store",
    headers: cookie
      ? {
          cookie,
        }
      : undefined,
  });
}