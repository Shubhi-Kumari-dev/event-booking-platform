"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setLoading(true);
    try {
      await apiFetch(`/api/events/${eventId}`, { method: "DELETE" });
      toast.success("Event deleted");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete event");
      }
    } finally {
      setLoading(false);
      setConfirming(false);
    }
  }

  return (
    <Button
      variant={confirming ? "destructive" : "outline"}
      size="sm"
      onClick={handleDelete}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
      ) : (
        <Trash2 className="mr-1.5 size-3.5" />
      )}
      {loading ? "Deleting..." : confirming ? "Confirm delete" : "Delete"}
    </Button>
  );
}