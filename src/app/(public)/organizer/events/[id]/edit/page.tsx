"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toDatetimeLocal(iso: string) {
    // Converts an ISO date string to the format <input type="datetime-local"> expects
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok) {
          throw new Error(data?.error?.message || `Failed to load event (${res.status})`);
        }

        const event = data.data ?? data;

        setTitle(event.title ?? "");
        setDescription(event.description ?? "");
        setCategory(event.category ?? "");
        setVenue(event.venue ?? "");
        setAddress(event.address ?? "");
        setCity(event.city ?? "");
        setStartDate(event.startDate ? toDatetimeLocal(event.startDate) : "");
        setEndDate(event.endDate ? toDatetimeLocal(event.endDate) : "");
        setStatus(event.status ?? "DRAFT");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event");
      } finally {
        setFetching(false);
      }
    }

    loadEvent();
  }, [eventId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          venue,
          address,
          city,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status,
        }),
      });

      const text = await response.text();
      let data: any = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            data?.message ||
            data?.error ||
            `Failed to update event (${response.status})`
        );
      }

      alert("Event updated successfully!");

      router.push("/organizer/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="max-w-xl space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="mt-1 text-muted-foreground">Update the details for your event.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1 block font-medium">Event Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2"
            placeholder="Enter event title"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2"
            placeholder="Enter event description"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2"
            placeholder="e.g. Music, Sports, Technology"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Venue</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2"
            placeholder="Enter venue name"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2"
            placeholder="Enter full address"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2"
            placeholder="Enter city"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Start Date & Time</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">End Date & Time</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}