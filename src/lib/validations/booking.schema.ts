import { z } from "zod";
import { BOOKING_STATUS } from "@/lib/constants";

export const bookingItemSchema = z.object({
  ticketTypeId: z.string().min(1, "Ticket type is required"),
  quantity: z.number().int().positive().max(10, "Maximum 10 tickets per type"),
});

export const createBookingSchema = z
  .object({
    eventId: z.string().min(1, "Event ID is required"),
    ticketTypeId: z.string().min(1).optional(),
    quantity: z.number().int().positive().max(10).optional(),
    items: z.array(bookingItemSchema).min(1).optional(),
  })
  .refine(
    (data) => (data.ticketTypeId && data.quantity) || (data.items && data.items.length > 0),
    { message: "Either ticketTypeId & quantity or items must be provided" }
  );

export const updateBookingSchema = z.object({
  status: z.enum([BOOKING_STATUS.CANCELLED]),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;