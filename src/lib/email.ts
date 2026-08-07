import { Resend } from "resend";
import { logger } from "@/lib/logger";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "Eventify <onboarding@resend.dev>";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface BookingConfirmationInput {
  to: string;
  name: string;
  eventTitle: string;
  bookingReference: string;
  quantity: number;
  totalAmount: string;
}

export async function sendBookingConfirmationEmail(input: BookingConfirmationInput) {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping booking confirmation email", { to: input.to });
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: `Booking Confirmed: ${input.eventTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2>Booking Confirmed 🎉</h2>
          <p>Hi ${input.name},</p>
          <p>Your booking for <strong>${input.eventTitle}</strong> is confirmed.</p>
          <p><strong>Reference:</strong> ${input.bookingReference}</p>
          <p><strong>Tickets:</strong> ${input.quantity}</p>
          <p><strong>Total Paid:</strong> ${input.totalAmount}</p>
          <p>You can find your QR tickets in your dashboard.</p>
        </div>
      `,
    });
  } catch (error) {
    logger.error("Failed to send booking confirmation email", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) {
    logger.warn("RESEND_API_KEY not set — skipping welcome email", { to });
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: "Welcome to Eventify",
      html: `<p>Hi ${name}, your account has been created successfully.</p>`,
    });
  } catch (error) {
    logger.error("Failed to send welcome email", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}