import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/api-auth";
import { verifyTicketSchema } from "@/lib/validations/ticket.schema";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { ForbiddenError } from "@/lib/errors";
import { ROLES, TICKET_STATUS } from "@/lib/constants";
import { logger } from "@/lib/logger";

type VerifyResult =
  | "VALID"
  | "ALREADY_USED"
  | "CANCELLED"
  | "WRONG_EVENT"
  | "NOT_FOUND";

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
    const body = await req.json();
    const { qrCode, eventId } = verifyTicketSchema.parse(body);

    const ticket = await db.ticket.findUnique({
      where: { qrCode },
      include: {
        booking: {
          include: {
            event: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!ticket) {
      return apiError("Ticket not found", 404, "NOT_FOUND", { result: "NOT_FOUND" as VerifyResult });
    }

    if (ticket.booking.event.organizerId !== user.id && user.role !== ROLES.ADMIN) {
      throw new ForbiddenError("You do not manage this event");
    }

    if (ticket.booking.eventId !== eventId) {
      logger.warn("Wrong event scan attempt", { ticketId: ticket.id, scannedEventId: eventId });
      return apiError(
        `This ticket belongs to "${ticket.booking.event.title}", not the scanned event`,
        409,
        "WRONG_EVENT",
        { result: "WRONG_EVENT" as VerifyResult, actualEventTitle: ticket.booking.event.title }
      );
    }

    if (ticket.status === TICKET_STATUS.CANCELLED) {
      return apiError("This ticket has been cancelled", 409, "CANCELLED", {
        result: "CANCELLED" as VerifyResult,
      });
    }

    if (ticket.status === TICKET_STATUS.USED) {
      return apiError(
        `Ticket already checked in at ${ticket.checkedInAt?.toISOString() ?? "an earlier time"}`,
        409,
        "ALREADY_USED",
        { result: "ALREADY_USED" as VerifyResult, checkedInAt: ticket.checkedInAt }
      );
    }

    const updated = await db.ticket.update({
      where: { id: ticket.id },
      data: { status: TICKET_STATUS.USED, checkedInAt: new Date() },
    });

    logger.info("Ticket checked in", { ticketId: ticket.id, eventId: ticket.booking.eventId });

    return apiSuccess(
      {
        result: "VALID" as VerifyResult,
        ticket: updated,
        attendee: ticket.booking.user,
        event: { id: ticket.booking.event.id, title: ticket.booking.event.title },
      },
      "Ticket verified successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}