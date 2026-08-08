import { apiFetch, ApiError } from "@/lib/api";

export type VerifyResult = "VALID" | "ALREADY_USED" | "WRONG_EVENT" | "CANCELLED" | "NOT_FOUND";

export interface VerifyTicketResponse {
  result: VerifyResult;
  message: string;
  ticket?: { id: string; checkedInAt: string | null };
  attendee?: { id: string; name: string; email: string };
  event?: { id: string; title: string };
  actualEventTitle?: string;
}

export async function verifyTicket(qrCode: string, eventId: string): Promise<VerifyTicketResponse> {
  try {
    const data = await apiFetch<{
      result: VerifyResult;
      ticket: { id: string; checkedInAt: string | null };
      attendee: { id: string; name: string; email: string };
      event: { id: string; title: string };
    }>("/api/tickets/verify", {
      method: "POST",
      body: JSON.stringify({ qrCode, eventId }),
    });

    return {
      result: data.result,
      message: "Ticket verified successfully",
      ticket: data.ticket,
      attendee: data.attendee,
      event: data.event,
    };
  } catch (err) {
    if (err instanceof ApiError) {
      const details = err.details as { result?: VerifyResult; actualEventTitle?: string } | undefined;
      const result = details?.result ?? (err.code as VerifyResult) ?? "NOT_FOUND";
      return {
        result,
        message: err.message,
        actualEventTitle: details?.actualEventTitle,
      };
    }
    throw err;
  }
}