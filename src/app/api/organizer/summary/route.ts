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
      take: 8,
      include: {
        event: { select: { title: true } },
        user: { select: { name: true, email: true } },
        ticketType: { select: { name: true } },
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

    const revenueByCategoryMap: Record<string, { revenue: number; ticketsSold: number }> = {};
    for (const e of events) {
      const cat = e.category || "Other";
      if (!revenueByCategoryMap[cat]) {
        revenueByCategoryMap[cat] = { revenue: 0, ticketsSold: 0 };
      }
      for (const t of e.ticketTypes) {
        revenueByCategoryMap[cat].revenue += Number(t.price) * t.quantitySold;
        revenueByCategoryMap[cat].ticketsSold += t.quantitySold;
      }
    }

    const revenueByCategory = Object.entries(revenueByCategoryMap)
      .map(([category, data]) => ({
        category,
        revenue: data.revenue,
        ticketsSold: data.ticketsSold,
      }))
      .filter((item) => item.revenue > 0 || item.ticketsSold > 0)
      .sort((a, b) => b.revenue - a.revenue);

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
        attendeeEmail: b.user.email,
        ticketTypeName: b.ticketType.name,
        quantity: b.quantity,
        totalAmount: b.totalAmount,
        status: b.status,
        createdAt: b.createdAt,
      })),
      upcomingEvents,
      revenueByCategory,
    });
  } catch (error) {
    return handleApiError(error);
  }
}