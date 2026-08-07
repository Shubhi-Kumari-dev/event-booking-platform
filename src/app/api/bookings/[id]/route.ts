import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "@/lib/errors";
import { generateQrDataUrl } from "@/lib/qrcode";
import { ROLES } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            venue: true,
            address: true,
            city: true,
            startDate: true,
            endDate: true,
          },
        },
        ticketType: true,
        tickets: true,
        payment: true,
      },
    });

    if (!booking) {
      throw new NotFoundError("Booking");
    }

    if (
      booking.userId !== user.id &&
      user.role !== ROLES.ADMIN
    ) {
      throw new ForbiddenError(
        "You do not have access to this booking"
      );
    }

    const ticketsWithQr = await Promise.all(
      booking.tickets.map(async (ticket) => ({
        ...ticket,
        qrDataUrl: await generateQrDataUrl(ticket.qrCode),
      }))
    );

    return apiSuccess({
      ...booking,
      tickets: ticketsWithQr,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const user = await requireAuth();

    const result = await db.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id },
        include: {
          tickets: true,
          ticketType: true,
        },
      });

      if (!booking) {
        throw new NotFoundError("Booking");
      }

      if (
        booking.userId !== user.id &&
        user.role !== ROLES.ADMIN
      ) {
        throw new ForbiddenError(
          "You do not have access to this booking"
        );
      }

      if (
        booking.status !== "CONFIRMED" &&
        booking.status !== "PENDING"
      ) {
        throw new ConflictError(
          "This booking cannot be cancelled"
        );
      }

      const hasUsedTicket = booking.tickets.some(
        (ticket) => ticket.status === "USED"
      );

      if (hasUsedTicket) {
        throw new ConflictError(
          "A booking with a checked-in ticket cannot be cancelled"
        );
      }

      /*
       * Change the booking status first using a conditional update.
       * This prevents two simultaneous cancellation requests from
       * both restoring the inventory.
       */
      const bookingUpdate = await tx.booking.updateMany({
        where: {
          id: booking.id,
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
        },
        data: {
          status: "CANCELLED",
        },
      });

      if (bookingUpdate.count === 0) {
        throw new ConflictError(
          "This booking has already been cancelled"
        );
      }

      /*
       * Restore the seats that were claimed during booking.
       * The condition prevents quantitySold from going negative.
       */
      const inventoryUpdate = await tx.ticketType.updateMany({
        where: {
          id: booking.ticketTypeId,
          quantitySold: {
            gte: booking.quantity,
          },
        },
        data: {
          quantitySold: {
            decrement: booking.quantity,
          },
        },
      });

      if (inventoryUpdate.count === 0) {
        throw new ConflictError(
          "Could not restore ticket inventory"
        );
      }

      await tx.ticket.updateMany({
        where: {
          bookingId: booking.id,
          status: "VALID",
        },
        data: {
          status: "CANCELLED",
        },
      });

      return tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          tickets: true,
        },
      });
    });

    return apiSuccess(
      result,
      "Booking cancelled successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}