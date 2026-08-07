import type { Role, EventStatus, BookingStatus, TicketStatus } from "@prisma/client";

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: Role;
}

export type { Role, EventStatus, BookingStatus, TicketStatus };

export interface EventWithRelations {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  coverImage: string | null;
  venue: string;
  address: string;
  city: string;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  organizerId: string;
  createdAt: Date;
  updatedAt: Date;
}