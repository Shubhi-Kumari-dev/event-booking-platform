import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { ROLES, TICKET_STATUS } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);

    const event = await db.event.findUnique({
      where: { id },
      include: {
        ticketTypes: true,
        bookings: {
          where: { status: "CONFIRMED" },
          include: {
            user: { select: { id: true, name: true, email: true } },
            ticketType: { select: { name: true, price: true } },
            tickets: { select: { id: true, status: true, checkedInAt: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!event) throw new NotFoundError("Event");
    if (event.organizerId !== user.id && user.role !== ROLES.ADMIN) {
      throw new ForbiddenError("You do not own this event");
    }

    const totalCapacity = event.ticketTypes.reduce((sum, t) => sum + t.quantity, 0);
    const totalSold = event.ticketTypes.reduce((sum, t) => sum + t.quantitySold, 0);
    const revenue = event.ticketTypes.reduce(
      (sum, t) => sum + Number(t.price) * t.quantitySold,
      0
    );

    const allTickets = event.bookings.flatMap((b) => b.tickets);
    const checkedIn = allTickets.filter((t) => t.status === TICKET_STATUS.USED).length;

    const salesByTicketType = event.ticketTypes.map((t) => ({
      name: t.name,
      quantity: t.quantity,
      quantitySold: t.quantitySold,
      revenue: Number(t.price) * t.quantitySold,
    }));

    const attendees = event.bookings.map((b) => ({
      bookingId: b.id,
      bookingReference: b.bookingReference,
      user: b.user,
      ticketType: b.ticketType.name,
      quantity: b.quantity,
      totalAmount: b.totalAmount,
      checkedInCount: b.tickets.filter((t) => t.status === TICKET_STATUS.USED).length,
      createdAt: b.createdAt,
    }));

    return apiSuccess({
      event: { id: event.id, title: event.title, status: event.status, startDate: event.startDate },
      stats: {
        totalCapacity,
        totalSold,
        totalRemaining: totalCapacity - totalSold,
        revenue,
        checkedIn,
        checkInRate: allTickets.length ? Number((checkedIn / allTickets.length).toFixed(2)) : 0,
        salesByTicketType,
      },
      attendees,
    });
  } catch (error) {
    return handleApiError(error);
  }
}