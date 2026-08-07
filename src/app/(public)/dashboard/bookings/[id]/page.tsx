import { notFound } from "next/navigation";
import { CancelBookingButton } from "@/components/features/bookings/cancel-booking-button";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";

import { getBooking } from "@/services/bookings";
import { ApiError } from "@/lib/api";
import {
  formatEventDate,
  formatEventTime,
  formatPrice,
} from "@/lib/format";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

const TICKET_STATUS_LABEL: Record<string, string> = {
  VALID: "Valid",
  USED: "Checked in",
  CANCELLED: "Cancelled",
};

export default async function BookingConfirmationPage({
  params,
}: BookingDetailPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
let booking;

try {
  booking = await getBooking(id, cookieHeader);  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 403)
    ) {
      notFound();
    }

    throw error;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Back */}
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to my bookings
      </Link>

      {/* Confirmation heading */}
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="size-7 text-primary" />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Booking confirmed 🎉
        </h1>

        <p className="font-mono text-sm text-muted-foreground">
          Booking reference: {booking.bookingReference}
        </p>

        <Badge className="mt-1">{booking.status}</Badge>
      </div>
      {(booking.status === "CONFIRMED" ||
  booking.status === "PENDING") &&
  booking.tickets.every(
    (ticket) => ticket.status !== "USED"
  ) && (
    <div className="mt-6 flex justify-center">
      <CancelBookingButton bookingId={booking.id} />
    </div>
  )}

      {/* Event card */}
      <section className="ticket-stub overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted">
          {booking.event.coverImage ? (
            <Image
              src={booking.event.coverImage}
              alt={booking.event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-primary/5">
              <Calendar className="size-10 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6">
          <h2 className="text-xl font-semibold">
            {booking.event.title}
          </h2>

          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatEventDate(booking.event.startDate)}
            </span>

            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {formatEventTime(booking.event.startDate)}
            </span>

            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {booking.event.venue}, {booking.event.city}
            </span>
          </div>

          <Separator className="my-5" />

          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Ticket type</p>
              <p className="mt-0.5 font-medium">
                {booking.ticketType.name}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="mt-0.5 font-medium">
                {booking.quantity}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Total paid</p>
              <p className="mt-0.5 font-mono font-medium">
                {formatPrice(booking.totalAmount)}
              </p>
            </div>

            <div>
              <p className="text-muted-foreground">Booked on</p>
              <p className="mt-0.5 font-medium">
                {formatEventDate(booking.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QR Tickets */}
      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            Your ticket{booking.tickets.length > 1 ? "s" : ""}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Show this QR code at the venue entrance.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {booking.tickets.map((ticket, index) => (
            <div
              key={ticket.id}
              className="ticket-stub flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-5 text-center shadow-sm"
            >
              {/* QR */}
              <div className="overflow-hidden rounded-xl border border-border bg-white p-3">
                {/* QR is a generated data URL, so next/image is not needed */}
                <img
                  src={ticket.qrDataUrl}
                  alt={`QR code for ticket ${index + 1}`}
                  width={200}
                  height={200}
                  className="size-[200px]"
                />
              </div>

              {/* Ticket information */}
              <div>
                <p className="font-medium">
                  Ticket {index + 1}
                </p>

                <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                  {ticket.qrCode}
                </p>
              </div>

              <Badge
                variant={
                  ticket.status === "VALID"
                    ? "default"
                    : "outline"
                }
              >
                {TICKET_STATUS_LABEL[ticket.status] ??
                  ticket.status}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
        <p>
          Keep this QR code ready when you arrive at the event.
        </p>

        <p className="mt-1">
          Your booking confirmation has also been sent to your email.
        </p>
      </div>
    </main>
  );
}