"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttendeeRecord {
  bookingId: string;
  bookingReference: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  ticketType: string;
  quantity: number;
  totalAmount: number;
  checkedInCount: number;
  createdAt: string;
}

interface ExportCsvButtonProps {
  attendees: AttendeeRecord[];
  eventTitle: string;
}

function escapeCsvField(val: string | number): string {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function ExportCsvButton({
  attendees,
  eventTitle,
}: ExportCsvButtonProps) {
  function handleExportCsv() {
    if (!attendees || attendees.length === 0) return;

    const headers = [
      "Attendee Name",
      "Email",
      "Ticket Type",
      "Quantity",
      "Total Amount (INR)",
      "Checked In",
      "Booking Reference",
      "Booked Date",
    ];

    const rows = attendees.map((a) => [
      escapeCsvField(a.user.name),
      escapeCsvField(a.user.email),
      escapeCsvField(a.ticketType),
      escapeCsvField(a.quantity),
      escapeCsvField(a.totalAmount),
      escapeCsvField(`${a.checkedInCount} / ${a.quantity}`),
      escapeCsvField(a.bookingReference),
      escapeCsvField(new Date(a.createdAt).toLocaleDateString()),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const safeTitle = eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    link.setAttribute("download", `${safeTitle}-attendees.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExportCsv}
      disabled={!attendees || attendees.length === 0}
    >
      <Download className="mr-1.5 size-4" />
      Export Attendees (CSV)
    </Button>
  );
}
