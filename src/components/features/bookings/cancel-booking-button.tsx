"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelBooking } from "@/services/bookings";
import { Button } from "@/components/ui/button";

interface CancelBookingButtonProps {
  bookingId: string;
}

export function CancelBookingButton({
  bookingId,
}: CancelBookingButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking? Your tickets will no longer be valid."
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      await cancelBooking(bookingId);

      router.refresh();
    } catch (error) {
      console.error(error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to cancel booking"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="destructive"
      onClick={handleCancel}
      disabled={loading}
    >
      {loading ? "Cancelling..." : "Cancel Booking"}
    </Button>
  );
}