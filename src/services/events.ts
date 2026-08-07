import { apiFetch } from "@/lib/api";
import type { PaginatedResponse, EventWithRelations } from "@/types";

export interface TicketTypeDTO {
  id: string;
  name: string;
  description: string | null;
  price: string;
  quantity: number;
  quantitySold: number;
}

export interface EventListItem extends EventWithRelations {
  ticketTypes: TicketTypeDTO[];
  organizer: { id: string; name: string };
}

export interface EventQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  city?: string;
  search?: string;
  sortBy?: "date" | "priceAsc" | "priceDesc" | "newest";
  startDateFrom?: string;
  startDateTo?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getEvents(params: EventQueryParams = {}) {
  return apiFetch<PaginatedResponse<EventListItem>>("/api/events", {
    params: params as Record<string, string | number | undefined>,
    cache: "no-store",
  });
}

export async function getEvent(idOrSlug: string) {
  return apiFetch<EventListItem & { organizer: { id: string; name: string; email: string } }>(
    `/api/events/${idOrSlug}`,
    { cache: "no-store" }
  );
}