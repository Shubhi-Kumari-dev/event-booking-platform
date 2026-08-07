import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { getPagination, buildPaginationMeta } from "@/lib/utils";
import { ROLES } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = getPagination(searchParams);
    const status = searchParams.get("status");

    const where: Prisma.EventWhereInput = {
      organizerId: user.id,
      ...(status ? { status: status as Prisma.EnumEventStatusFilter["equals"] } : {}),
    };

    const [items, total] = await Promise.all([
      db.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          ticketTypes: true,
          _count: { select: { bookings: true } },
        },
      }),
      db.event.count({ where }),
    ]);

    const withStats = items.map((event) => {
      const totalCapacity = event.ticketTypes.reduce((sum, t) => sum + t.quantity, 0);
      const totalSold = event.ticketTypes.reduce((sum, t) => sum + t.quantitySold, 0);
      const revenue = event.ticketTypes.reduce(
        (sum, t) => sum + Number(t.price) * t.quantitySold,
        0
      );
      return { ...event, stats: { totalCapacity, totalSold, revenue, bookingsCount: event._count.bookings } };
    });

    return apiSuccess({ items: withStats, meta: buildPaginationMeta(total, page, limit) });
  } catch (error) {
    return handleApiError(error);
  }
}