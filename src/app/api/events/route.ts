import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { createEventSchema, eventQuerySchema } from "@/lib/validations/event.schema";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { generateUniqueSlug, getPagination, buildPaginationMeta } from "@/lib/utils";
import { ROLES, EVENT_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = eventQuerySchema.parse(Object.fromEntries(searchParams));
    const { page, limit, skip } = getPagination(searchParams);

    const where: Prisma.EventWhereInput = {
      deletedAt: null,
      status: query.status ?? EVENT_STATUS.PUBLISHED,
      ...(query.category ? { category: query.category } : {}),
      ...(query.city ? { city: { equals: query.city, mode: "insensitive" } } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.startDateFrom || query.startDateTo
        ? {
            startDate: {
              ...(query.startDateFrom ? { gte: query.startDateFrom } : {}),
              ...(query.startDateTo ? { lte: query.startDateTo } : {}),
            },
          }
        : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            ticketTypes: {
              some: {
                price: {
                  ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
                  ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
                },
              },
            },
          }
        : {}),
    };

    const orderBy: Prisma.EventOrderByWithRelationInput =
      query.sortBy === "newest"
        ? { createdAt: "desc" }
        : query.sortBy === "priceAsc" || query.sortBy === "priceDesc"
          ? { ticketTypes: { _count: "desc" } } // fallback ordering; real price sort below
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

    // Price sort applied in-memory on the page slice since it depends on
    // an aggregate (min ticket price) across a relation, which Prisma
    // cannot order by directly without a raw query.
    const items =
      query.sortBy === "priceAsc" || query.sortBy === "priceDesc"
        ? [...itemsRaw].sort((a, b) => {
            const minA = Math.min(...a.ticketTypes.map((t) => Number(t.price)));
            const minB = Math.min(...b.ticketTypes.map((t) => Number(t.price)));
            return query.sortBy === "priceAsc" ? minA - minB : minB - minA;
          })
        : itemsRaw;

    return apiSuccess({ items, meta: buildPaginationMeta(total, page, limit) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
    const body = await req.json();
    const data = createEventSchema.parse(body);

    const slug = generateUniqueSlug(data.title);

    const event = await db.event.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        category: data.category,
        coverImage: data.coverImage,
        venue: data.venue,
        address: data.address,
        city: data.city,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        organizerId: user.id,
        ticketTypes: {
          create: data.ticketTypes.map((t) => ({
            name: t.name,
            description: t.description,
            price: t.price,
            quantity: t.quantity,
          })),
        },
      },
      include: { ticketTypes: true },
    });

    logger.info("Event created", { eventId: event.id, organizerId: user.id });

    return apiSuccess(event, "Event created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}