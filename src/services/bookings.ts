import { apiFetch } from "@/lib/api";
import type { BookingStatus } from "@/types";

export interface TicketDTO {
  id: string;
  bookingId: string;
  qrCode: string;
  qrDataUrl: string;
  seatNumber: string | null;
  status: "VALID" | "USED" | "CANCELLED";
  checkedInAt: string | null;
  createdAt: string;
}

export interface BookingEventSummary {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  venue: string;
  city?: string;
  address?: string;
  startDate: string;
  endDate?: string;
}

export interface BookingTicketTypeSummary {
  id: string;
  name: string;
  price: string;
}

export interface BookingListItem {
  id: string;
  bookingReference: string;
  quantity: number;
  totalAmount: string;
  status: BookingStatus;
  createdAt: string;
  event: BookingEventSummary;
  ticketType: BookingTicketTypeSummary;
  tickets: { id: string; status: string }[];
}

export interface BookingDetail
  extends Omit<BookingListItem, "event" | "tickets"> {
  event: Required<BookingEventSummary>;
  tickets: TicketDTO[];
  payment: { id: string; status: string } | null;
}

export async function getMyBookings(cookie?: string) {
  return apiFetch<BookingListItem[]>("/api/bookings", {
    cache: "no-store",
    headers: cookie
      ? {
          cookie,
        }
      : undefined,
  });
}

export async function getBooking(id: string, cookie?: string) {
  return apiFetch<BookingDetail>(`/api/bookings/${id}`, {
    cache: "no-store",
    headers: cookie
      ? {
          cookie,
        }
      : undefined,
  });
}

export interface CreateBookingInput {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}

export async function createBooking(input: CreateBookingInput) {
  return apiFetch<BookingDetail>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export async function cancelBooking(id: string) {
  return apiFetch(`/api/bookings/${id}`, {
    method: "DELETE",
    cache: "no-store",
  });
}