import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { createBookingSchema } from "@/lib/validations/booking.schema";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { generateBookingReference, formatCurrency } from "@/lib/utils";
import { generateTicketToken, generateQrDataUrl } from "@/lib/qrcode";
import {
  sendBookingConfirmationEmail,
  sendOrganizerBookingNotificationEmail,
} from "@/lib/email";
import { BOOKING_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const user = await requireAuth();

    const bookings = await db.booking.findMany({
      where: { userId: user.id },
      include: {
        event: { select: { id: true, title: true, slug: true, coverImage: true, startDate: true, venue: true } },
        ticketType: true,
        tickets: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(bookings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const data = createBookingSchema.parse(body);

    const itemsToBook =
      data.items && data.items.length > 0
        ? data.items
        : [{ ticketTypeId: data.ticketTypeId!, quantity: data.quantity! }];

    const result = await db.$transaction(async (tx) => {
      const createdBookings = [];
      let totalAmountCombined = 0;
      let eventTitle = "";
      let eventOrganizer: { id: string; name: string; email: string } | null = null;

      for (const item of itemsToBook) {
        const ticketType = await tx.ticketType.findUnique({
          where: { id: item.ticketTypeId },
          include: {
            event: {
              include: {
                organizer: { select: { id: true, name: true, email: true } },
              },
            },
          },
        });

        if (!ticketType || ticketType.eventId !== data.eventId) {
          throw new NotFoundError("Ticket type");
        }

        eventTitle = ticketType.event.title;
        eventOrganizer = ticketType.event.organizer;

        // Atomic conditional update: only succeeds if enough seats remain
        // at the moment of the UPDATE (not the earlier read). This closes
        // the race window between two concurrent bookings.
        const claim = await tx.ticketType.updateMany({
          where: {
            id: ticketType.id,
            quantitySold: { lte: ticketType.quantity - item.quantity },
          },
          data: { quantitySold: { increment: item.quantity } },
        });

        if (claim.count === 0) {
          throw new ConflictError(`Not enough seats remaining for ${ticketType.name}`);
        }

        const itemTotal = Number(ticketType.price) * item.quantity;
        totalAmountCombined += itemTotal;
        const bookingReference = generateBookingReference();

        const booking = await tx.booking.create({
          data: {
            bookingReference,
            userId: user.id,
            eventId: data.eventId,
            ticketTypeId: item.ticketTypeId,
            quantity: item.quantity,
            totalAmount: itemTotal,
            status: BOOKING_STATUS.CONFIRMED,
          },
        });

        await tx.ticket.createMany({
          data: Array.from({ length: item.quantity }).map(() => ({
            bookingId: booking.id,
            qrCode: generateTicketToken(),
          })),
        });

        const tickets = await tx.ticket.findMany({ where: { bookingId: booking.id } });
        createdBookings.push({ booking, tickets, ticketType, totalAmount: itemTotal });
      }

      return { createdBookings, totalAmountCombined, eventTitle, eventOrganizer };
    });

    const primaryBooking = result.createdBookings[0];
    const ticketsWithQr = await Promise.all(
      primaryBooking.tickets.map(async (ticket) => ({
        ...ticket,
        qrDataUrl: await generateQrDataUrl(ticket.qrCode),
      }))
    );

    const totalTicketsCount = result.createdBookings.reduce(
      (sum, b) => sum + b.booking.quantity,
      0
    );

    // Send confirmation email to the attendee
    void sendBookingConfirmationEmail({
      to: user.email,
      name: user.name,
      eventTitle: result.eventTitle,
      bookingReference: result.createdBookings.map((b) => b.booking.bookingReference).join(", "),
      quantity: totalTicketsCount,
      totalAmount: formatCurrency(result.totalAmountCombined),
    });

    // Send instant notification email to the event host (organizer)
    if (result.eventOrganizer?.email) {
      void sendOrganizerBookingNotificationEmail({
        to: result.eventOrganizer.email,
        organizerName: result.eventOrganizer.name,
        attendeeName: user.name,
        attendeeEmail: user.email,
        eventTitle: result.eventTitle,
        bookingReference: result.createdBookings.map((b) => b.booking.bookingReference).join(", "),
        quantity: totalTicketsCount,
        totalAmount: formatCurrency(result.totalAmountCombined),
      });
    }

    logger.info("Booking(s) created and notifications dispatched", {
      bookingIds: result.createdBookings.map((b) => b.booking.id),
      userId: user.id,
      organizerEmail: result.eventOrganizer?.email,
    });

    return apiSuccess(
      {
        ...primaryBooking.booking,
        tickets: ticketsWithQr,
        bookings: result.createdBookings.map((b) => b.booking),
      },
      "Booking confirmed successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}