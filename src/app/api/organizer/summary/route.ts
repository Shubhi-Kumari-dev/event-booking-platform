import { db } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { ROLES, TICKET_STATUS } from "@/lib/constants";

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

    const eventIds = events.map((e) => e.id);

    const [totalTicketsIssued, ticketsCheckedIn] = await Promise.all([
      db.ticket.count({
        where: { booking: { eventId: { in: eventIds } } },
      }),
      db.ticket.count({
        where: {
          booking: { eventId: { in: eventIds } },
          status: TICKET_STATUS.USED,
        },
      }),
    ]);

    const checkInRate =
      totalTicketsIssued > 0 ? Math.round((ticketsCheckedIn / totalTicketsIssued) * 100) : 0;

    const recentBookings = await db.booking.findMany({
      where: { eventId: { in: eventIds } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        event: { select: { title: true } },
        user: { select: { name: true, email: true } },
      },
    });

    const upcomingEvents = events
      .filter((e) => e.status === "PUBLISHED" && new Date(e.startDate) > new Date())
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        title: e.title,
        startDate: e.startDate,
        city: e.city,
      }));

    return apiSuccess({
      totalEvents,
      publishedEvents,
      totalRevenue,
      totalTicketsSold,
      totalBookings,
      checkInRate,
      ticketsCheckedIn,
      totalTicketsIssued,
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        bookingReference: b.bookingReference,
        eventTitle: b.event.title,
        attendeeName: b.user.name,
        totalAmount: b.totalAmount,
        status: b.status,
        createdAt: b.createdAt,
      })),
      upcomingEvents,
    });
  } catch (error) {
    return handleApiError(error);
  }
}