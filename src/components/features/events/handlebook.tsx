"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Ticket, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import { apiFetch, ApiError } from "@/lib/api";
import type { EventListItem } from "@/services/events";

export function TicketSelector({
  event,
  lowestPrice,
}: {
  event: EventListItem;
  lowestPrice: number;
}) {
  const { data: session } = useSession();
  const router = useRouter();

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  function setQty(ticketTypeId: string, delta: number, max: number) {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] ?? 0;
      const next = Math.min(Math.max(current + delta, 0), max);

      // Booking API supports one ticket type per booking.
      if (next === 0) {
        const { [ticketTypeId]: _, ...rest } = prev;
        return rest;
      }

      return { [ticketTypeId]: next };
    });
  }

  const selectedEntry = Object.entries(quantities)[0];
  const selectedTicketTypeId = selectedEntry?.[0];
  const totalQty = selectedEntry?.[1] ?? 0;

  const selectedTicketType = event.ticketTypes.find(
    (tt) => tt.id === selectedTicketTypeId
  );

  const totalPrice = selectedTicketType
    ? totalQty * Number(selectedTicketType.price)
    : 0;

  async function handleBook() {
    if (loading) return;

    if (!session?.user) {
      router.push(`/login?callbackUrl=/events/${event.slug}`);
      return;
    }

    if (!selectedTicketTypeId || totalQty === 0) {
      toast.error("Select at least one ticket");
      return;
    }

    setLoading(true);

    try {
      const booking = await apiFetch<{ id: string }>("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          eventId: event.id,
          ticketTypeId: selectedTicketTypeId,
          quantity: totalQty,
        }),
      });

      toast.success("Booking confirmed!");
      router.push(`/dashboard/bookings/${booking.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }

      setLoading(false);
    }
  }

  return (
    <div className="ticket-stub space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Starting from</span>

        <span className="font-mono text-lg font-semibold text-primary">
          {lowestPrice > 0 ? formatPrice(lowestPrice) : "Free"}
        </span>
      </div>

      <Separator />

      <div className="space-y-4">
        {event.ticketTypes.map((tt) => {
          const available = tt.quantity - tt.quantitySold;
          const qty = quantities[tt.id] ?? 0;
          const soldOut = available <= 0;

          const disabledByOtherSelection =
            selectedTicketTypeId !== undefined &&
            selectedTicketTypeId !== tt.id;

          return (
            <div key={tt.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{tt.name}</p>

                  <p className="font-mono text-xs text-muted-foreground">
                    {Number(tt.price) > 0
                      ? formatPrice(Number(tt.price))
                      : "Free"}
                  </p>
                </div>

                {soldOut ? (
                  <span className="text-xs font-medium text-destructive">
                    Sold out
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={qty === 0 || loading}
                      onClick={() => setQty(tt.id, -1, available)}
                    >
                      <Minus className="size-3.5" />
                    </Button>

                    <span className="w-5 text-center text-sm font-medium">
                      {qty}
                    </span>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={
                        qty >= available ||
                        disabledByOtherSelection ||
                        loading
                      }
                      onClick={() => setQty(tt.id, 1, available)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {!soldOut && (
                <p className="text-xs text-muted-foreground">
                  {available} seats left
                </p>
              )}
            </div>
          );
        })}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Total</span>

        <span className="font-mono text-base font-semibold">
          {totalPrice > 0 ? formatPrice(totalPrice) : "Free"}
        </span>
      </div>

      <Button
        onClick={handleBook}
        className="w-full"
        size="lg"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="mr-1.5 size-4 animate-spin" />
        ) : (
          <Ticket className="mr-1.5 size-4" />
        )}

        {loading
          ? "Booking..."
          : totalQty > 0
            ? `Book ${totalQty} ticket${totalQty > 1 ? "s" : ""}`
            : "Select tickets"}
      </Button>
    </div>
  );
}