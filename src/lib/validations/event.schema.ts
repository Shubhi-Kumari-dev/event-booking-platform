import { z } from "zod";
import { EVENT_STATUS } from "@/lib/constants";

const ticketTypeSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const createEventSchema = z
  .object({
    title: z.string().min(3).max(150),
    description: z.string().min(10),
    category: z.string().min(1),
    coverImage: z.string().url().optional(),
    venue: z.string().min(2),
    address: z.string().min(2),
    city: z.string().min(2),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z
      .enum([EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED])
      .default(EVENT_STATUS.DRAFT),
    ticketTypes: z
      .array(ticketTypeSchema)
      .min(1, "At least one ticket type is required"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const updateEventSchema = z.object({
  title: z.string().min(3).max(150).optional(),
  description: z.string().min(10).optional(),
  category: z.string().min(1).optional(),
  coverImage: z.string().url().optional(),
  venue: z.string().min(2).optional(),
  address: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z
    .enum([
      EVENT_STATUS.DRAFT,
      EVENT_STATUS.PUBLISHED,
      EVENT_STATUS.CANCELLED,
      EVENT_STATUS.COMPLETED,
    ])
    .optional(),
});

export const eventQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(12),

  category: z.string().optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),

  startDateFrom: z.coerce.date().optional(),
  startDateTo: z.coerce.date().optional(),

  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),

  sortBy: z
    .enum(["date", "priceAsc", "priceDesc", "newest"])
    .default("date"),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;