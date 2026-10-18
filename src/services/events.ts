import { db } from "@/lib/db";
import { EVENT_STATUS } from "@/lib/constants";
import type { Prisma } from "@prisma/client";
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

export async function getEvents(
  params: EventQueryParams = {}
): Promise<PaginatedResponse<EventListItem>> {
  try {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(Math.max(1, params.limit ?? 12), 50);
    const skip = (page - 1) * limit;

    const where: Prisma.EventWhereInput = {
      deletedAt: null,
      status: EVENT_STATUS.PUBLISHED,
      ...(params.category ? { category: params.category } : {}),
      ...(params.city ? { city: { equals: params.city, mode: "insensitive" } } : {}),
      ...(params.search
        ? {
            OR: [
              { title: { contains: params.search, mode: "insensitive" } },
              { description: { contains: params.search, mode: "insensitive" } },
              { venue: { contains: params.search, mode: "insensitive" } },
              { city: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(params.startDateFrom || params.startDateTo
        ? {
            startDate: {
              ...(params.startDateFrom ? { gte: new Date(params.startDateFrom) } : {}),
              ...(params.startDateTo ? { lte: new Date(params.startDateTo) } : {}),
            },
          }
        : {}),
      ...(params.minPrice !== undefined || params.maxPrice !== undefined
        ? {
            ticketTypes: {
              some: {
                price: {
                  ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
                  ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
                },
              },
            },
          }
        : {}),
    };

    const orderBy: Prisma.EventOrderByWithRelationInput =
      params.sortBy === "newest"
        ? { createdAt: "desc" }
        : { startDate: "asc" };

    const [itemsRaw, total] = await Promise.all([
      db.event.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          ticketTypes: true,
          organizer: { select: { id: true, name: true } },
        },
      }),
      db.event.count({ where }),
    ]);

    const itemsFormatted = itemsRaw.map((e) => ({
      ...e,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
      deletedAt: e.deletedAt ? e.deletedAt.toISOString() : null,
      ticketTypes: e.ticketTypes.map((t) => ({
        ...t,
        price: String(t.price),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    }));

    const items =
      params.sortBy === "priceAsc" || params.sortBy === "priceDesc"
        ? [...itemsFormatted].sort((a, b) => {
            const minA = Math.min(...a.ticketTypes.map((t) => Number(t.price)));
            const minB = Math.min(...b.ticketTypes.map((t) => Number(t.price)));
            return params.sortBy === "priceAsc" ? minA - minB : minB - minA;
          })
        : itemsFormatted;

    return {
      items: items as unknown as EventListItem[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  } catch (error) {
    console.error("Direct db query in getEvents failed:", error);
    return {
      items: [],
      meta: { page: 1, limit: 12, total: 0, totalPages: 0 },
    };
  }
}

export async function getEvent(idOrSlug: string) {
  try {
    const event = await db.event.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], deletedAt: null },
      include: {
        ticketTypes: true,
        organizer: { select: { id: true, name: true, email: true } },
      },
    });

    if (!event) return null;

    return {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      deletedAt: event.deletedAt ? event.deletedAt.toISOString() : null,
      ticketTypes: event.ticketTypes.map((t) => ({
        ...t,
        price: String(t.price),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    } as unknown as (EventListItem & { organizer: { id: string; name: string; email: string } });
  } catch (error) {
    console.error("Direct db query in getEvent failed:", error);
    return null;
  }
}