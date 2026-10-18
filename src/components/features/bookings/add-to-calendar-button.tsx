"use client";

import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddToCalendarButtonProps {
  event: {
    title: string;
    venue: string;
    city: string;
    startDate: string | Date;
    endDate?: string | Date;
  };
  bookingReference: string;
}

function formatDateToICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function AddToCalendarButton({
  event,
  bookingReference,
}: AddToCalendarButtonProps) {
  function handleDownloadICS() {
    const start = new Date(event.startDate);
    const end = event.endDate
      ? new Date(event.endDate)
      : new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours default

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Eventify//Event Booking Platform//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${bookingReference}@eventify.app`,
      `DTSTAMP:${formatDateToICS(new Date())}`,
      `DTSTART:${formatDateToICS(start)}`,
      `DTEND:${formatDateToICS(end)}`,
      `SUMMARY:${event.title.replace(/[,;]/g, " ")}`,
      `DESCRIPTION:Booking Reference: ${bookingReference}\\nVenue: ${event.venue}\\, ${event.city}`,
      `LOCATION:${event.venue.replace(/[,;]/g, " ")}\\, ${event.city.replace(/[,;]/g, " ")}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-invite.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownloadICS}>
      <CalendarPlus className="mr-1.5 size-4" />
      Add to calendar (.ics)
    </Button>
  );
}
