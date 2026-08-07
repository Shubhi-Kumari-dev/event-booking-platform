import { z } from "zod";

export const verifyTicketSchema = z.object({
  qrCode: z.string().min(1, "QR code is required"),
  eventId: z.string().cuid("A valid eventId is required to scope verification"),
});

export type VerifyTicketInput = z.infer<typeof verifyTicketSchema>;