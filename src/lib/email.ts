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

interface OrganizerBookingNotificationInput {
  to: string;
  organizerName: string;
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  bookingReference: string;
  quantity: number;
  totalAmount: string;
}

export async function sendOrganizerBookingNotificationEmail(input: OrganizerBookingNotificationInput) {
  if (!resend) {
    logger.info("Host Notification: New tickets booked!", {
      hostEmail: input.to,
      attendee: input.attendeeName,
      event: input.eventTitle,
      quantity: input.quantity,
      revenue: input.totalAmount,
    });
    return;
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: input.to,
      subject: `🎟️ New Booking Alert: ${input.quantity} ticket(s) booked for "${input.eventTitle}"`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <h2 style="color: #4f46e5; margin-top: 0;">New Ticket Booking! 🎟️</h2>
          <p>Hi <strong>${input.organizerName}</strong>,</p>
          <p>An attendee has just booked tickets for your event:</p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #4f46e5; margin: 16px 0;">
            <p style="margin: 6px 0;"><strong>Event:</strong> ${input.eventTitle}</p>
            <p style="margin: 6px 0;"><strong>Attendee:</strong> ${input.attendeeName} (<a href="mailto:${input.attendeeEmail}">${input.attendeeEmail}</a>)</p>
            <p style="margin: 6px 0;"><strong>Tickets Booked:</strong> <span style="background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${input.quantity}</span></p>
            <p style="margin: 6px 0;"><strong>Revenue:</strong> ${input.totalAmount}</p>
            <p style="margin: 6px 0;"><strong>Reference:</strong> <code>${input.bookingReference}</code></p>
          </div>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">You can monitor all bookings and check in attendees from your Organizer Dashboard.</p>
        </div>
      `,
    });
  } catch (error) {
    logger.error("Failed to send organizer booking notification email", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}