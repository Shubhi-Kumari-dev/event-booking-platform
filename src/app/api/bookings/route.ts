import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { createBookingSchema } from "@/lib/validations/booking.schema";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { generateBookingReference, formatCurrency } from "@/lib/utils";
import { generateTicketToken, generateQrDataUrl } from "@/lib/qrcode";
import { sendBookingConfirmationEmail } from "@/lib/email";
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

    const result = await db.$transaction(async (tx) => {
      const ticketType = await tx.ticketType.findUnique({
        where: { id: data.ticketTypeId },
        include: { event: true },
      });

      if (!ticketType || ticketType.eventId !== data.eventId) {
        throw new NotFoundError("Ticket type");
      }

      // Atomic conditional update: only succeeds if enough seats remain
      // at the moment of the UPDATE (not the earlier read). This closes
      // the race window between two concurrent bookings.
      const claim = await tx.ticketType.updateMany({
        where: {
          id: ticketType.id,
          quantitySold: { lte: ticketType.quantity - data.quantity },
        },
        data: { quantitySold: { increment: data.quantity } },
      });

      if (claim.count === 0) {
        throw new ConflictError("Not enough seats remaining for this ticket type");
      }

      const totalAmount = Number(ticketType.price) * data.quantity;
      const bookingReference = generateBookingReference();

      const booking = await tx.booking.create({
        data: {
          bookingReference,
          userId: user.id,
          eventId: data.eventId,
          ticketTypeId: data.ticketTypeId,
          quantity: data.quantity,
          totalAmount,
          status: BOOKING_STATUS.CONFIRMED,
        },
      });

      await tx.ticket.createMany({
        data: Array.from({ length: data.quantity }).map(() => ({
          bookingId: booking.id,
          qrCode: generateTicketToken(),
        })),
      });

      const tickets = await tx.ticket.findMany({ where: { bookingId: booking.id } });

      return { booking, tickets, event: ticketType.event, totalAmount };
    });

    const ticketsWithQr = await Promise.all(
      result.tickets.map(async (ticket) => ({
        ...ticket,
        qrDataUrl: await generateQrDataUrl(ticket.qrCode),
      }))
    );

    void sendBookingConfirmationEmail({
      to: user.email,
      name: user.name,
      eventTitle: result.event.title,
      bookingReference: result.booking.bookingReference,
      quantity: result.booking.quantity,
      totalAmount: formatCurrency(result.totalAmount),
    });

    logger.info("Booking created", { bookingId: result.booking.id, userId: user.id });

    return apiSuccess(
      { ...result.booking, tickets: ticketsWithQr },
      "Booking confirmed successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}