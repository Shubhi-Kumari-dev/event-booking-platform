import { z } from "zod";
import { BOOKING_STATUS } from "@/lib/constants";

export const createBookingSchema = z.object({
  eventId: z.string().cuid(),
  ticketTypeId: z.string().cuid(),
  quantity: z.number().int().positive().max(10, "Maximum 10 tickets per booking"),
});

export const updateBookingSchema = z.object({
  status: z.enum([BOOKING_STATUS.CANCELLED]),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;