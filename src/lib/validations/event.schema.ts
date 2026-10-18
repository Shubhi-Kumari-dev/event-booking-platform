import { z } from "zod";
import { EVENT_STATUS } from "@/lib/constants";

const ticketTypeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ticket name is required")
    .max(50, "Ticket name cannot exceed 50 characters"),
  description: z
    .string()
    .max(500, "Ticket description cannot exceed 500 characters")
    .nullish()
    .or(z.literal(""))
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined)),
  price: z.coerce
    .number({ message: "Price must be a valid number" })
    .min(0, "Price must be 0 or more"),
  quantity: z.coerce
    .number({ message: "Quantity must be a valid number" })
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),
});

export const createEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title cannot exceed 150 characters"),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters"),
    category: z.string().trim().min(1, "Category is required"),
    coverImage: z
      .string()
      .nullish()
      .or(z.literal(""))
      .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined))
      .refine(
        (val) =>
          !val ||
          val.startsWith("http://") ||
          val.startsWith("https://") ||
          val.startsWith("/") ||
          val.startsWith("data:image/"),
        { message: "Cover image must be a valid URL or image path" }
      )
      .optional(),
    venue: z.string().trim().min(2, "Venue must be at least 2 characters"),
    address: z.string().trim().min(2, "Address must be at least 2 characters"),
    city: z.string().trim().min(2, "City must be at least 2 characters"),
    startDate: z.coerce.date({ message: "Please select a valid start date and time" }),
    endDate: z.coerce.date({ message: "Please select a valid end date and time" }),
    status: z
      .enum([EVENT_STATUS.DRAFT, EVENT_STATUS.PUBLISHED])
      .default(EVENT_STATUS.PUBLISHED),
    ticketTypes: z
      .array(ticketTypeSchema)
      .min(1, "At least one ticket type is required"),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      const start = new Date(data.startDate).getTime();
      const end = new Date(data.endDate).getTime();
      return !isNaN(start) && !isNaN(end) && end > start;
    },
    {
      message: "End date & time must be after the start date & time",
      path: ["endDate"],
    }
  );

export const updateEventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title cannot exceed 150 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .optional(),
    category: z.string().trim().min(1, "Category cannot be empty").optional(),
    coverImage: z
      .string()
      .nullish()
      .or(z.literal(""))
      .transform((val) => (val && val.trim().length > 0 ? val.trim() : null))
      .refine(
        (val) =>
          !val ||
          val.startsWith("http://") ||
          val.startsWith("https://") ||
          val.startsWith("/") ||
          val.startsWith("data:image/"),
        { message: "Cover image must be a valid URL or image path" }
      )
      .optional(),
    venue: z.string().trim().min(2, "Venue must be at least 2 characters").optional(),
    address: z.string().trim().min(2, "Address must be at least 2 characters").optional(),
    city: z.string().trim().min(2, "City must be at least 2 characters").optional(),
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
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      const start = new Date(data.startDate).getTime();
      const end = new Date(data.endDate).getTime();
      return isNaN(start) || isNaN(end) || end > start;
    },
    {
      message: "End date & time must be after the start date & time",
      path: ["endDate"],
    }
  );

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