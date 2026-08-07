import { db } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { ROLES } from "@/lib/constants";

export async function GET() {
  try {
    const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);

    const events = await db.event.findMany({
      where: { organizerId: user.id },
      include: { ticketTypes: true, _count: { select: { bookings: true } } },
    });

    const totalEvents = events.length;
    const publishedEvents = events.filter((e) => e.status === "PUBLISHED").length;
    const totalRevenue = events.reduce(
      (sum, e) => sum + e.ticketTypes.reduce((s, t) => s + Number(t.price) * t.quantitySold, 0),
      0
    );
    const totalTicketsSold = events.reduce(
      (sum, e) => sum + e.ticketTypes.reduce((s, t) => s + t.quantitySold, 0),
      0
    );
    const totalBookings = events.reduce((sum, e) => sum + e._count.bookings, 0);

    return apiSuccess({
      totalEvents,
      publishedEvents,
      totalRevenue,
      totalTicketsSold,
      totalBookings,
    });
  } catch (error) {
    return handleApiError(error);
  }
}