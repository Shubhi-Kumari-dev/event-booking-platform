import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { updateEventSchema } from "@/lib/validations/event.schema";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { ROLES, EVENT_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const event = await db.event.findFirst({
      where: { OR: [{ id }, { slug: id }], deletedAt: null },
      include: {
        ticketTypes: true,
        organizer: { select: { id: true, name: true, email: true } },
      },
    });

    if (!event) {
      throw new NotFoundError("Event");
    }

    return apiSuccess(event);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);

    const existing = await db.event.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundError("Event");
    }
    if (existing.organizerId !== user.id && user.role !== ROLES.ADMIN) {
      throw new ForbiddenError("You do not own this event");
    }

    const body = await req.json();
    const data = updateEventSchema.parse(body);

    const event = await db.event.update({
      where: { id },
      data,
      include: { ticketTypes: true },
    });

    logger.info("Event updated", { eventId: id, organizerId: user.id });

    return apiSuccess(event, "Event updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// Safe delete: events with any bookings are soft-deleted (deletedAt set,
// status -> CANCELLED) to preserve ticket/booking history and audit trail.
// Events with zero bookings are hard-deleted since nothing references them.
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);

    const existing = await db.event.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { bookings: true } } },
    });
    if (!existing) {
      throw new NotFoundError("Event");
    }
    if (existing.organizerId !== user.id && user.role !== ROLES.ADMIN) {
      throw new ForbiddenError("You do not own this event");
    }

    if (existing._count.bookings > 0) {
      const event = await db.event.update({
        where: { id },
        data: { deletedAt: new Date(), status: EVENT_STATUS.CANCELLED },
      });

      logger.info("Event soft-deleted (had bookings)", { eventId: id, organizerId: user.id });

      return apiSuccess(event, "Event cancelled. Booking history has been preserved.");
    }

    await db.event.delete({ where: { id } });

    logger.info("Event hard-deleted (no bookings)", { eventId: id, organizerId: user.id });

    return apiSuccess(null, "Event deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}