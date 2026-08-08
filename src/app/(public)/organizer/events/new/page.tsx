"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageUploader } from "@/components/features/organizer/image-uploader";

export default function NewEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const [ticketName, setTicketName] = useState("General");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketPrice, setTicketPrice] = useState("");
  const [ticketQuantity, setTicketQuantity] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
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
          status: "DRAFT",
          coverImage: coverImage || undefined,

          ticketTypes: [
            {
              name: ticketName,
              description: ticketDescription || undefined,
              price: Number(ticketPrice),
              quantity: Number(ticketQuantity),
            },
          ],
        }),
      });

      const text = await response.text();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        `Failed to create event (${response.status})`
);
      }

      alert("Event created successfully!");

      router.push("/organizer/events");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Create New Event
        </h1>

        <p className="mt-1 text-muted-foreground">
          Add details for your new event.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-xl space-y-5"
      >
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Event Title */}
        <div>
          <label className="mb-1 block font-medium">
            Event Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2"
            placeholder="Enter event title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-1 block font-medium">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            className="w-full rounded-lg border border-border bg-background p-2"
            placeholder="Enter event description"
            rows={4}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1 block font-medium">
            Category
          </label>

          <input
            type="text"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="w-full rounded-lg border border-border bg-background p-2"
            placeholder="e.g. Music, Sports, Technology"
            required
          />
        </div>

        {/* Venue */}
        <div>
          <label className="mb-1 block font-medium">
            Venue
          </label>

          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2"
            placeholder="Enter venue name"
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="mb-1 block font-medium">
            Address
          </label>

          <input
            type="text"
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
            className="w-full rounded-lg border border-border bg-background p-2"
            placeholder="Enter full address"
            required
          />
        </div>

        {/* City */}
        <div>
          <label className="mb-1 block font-medium">
            City
          </label>

          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2"
            placeholder="Enter city"
            required
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="mb-1 block font-medium">
            Start Date & Time
          </label>

          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) =>
              setStartDate(e.target.value)
            }
            className="w-full rounded-lg border border-border bg-background p-2"
            required
          />
        </div>

        {/* End Date */}
        <div>
          <label className="mb-1 block font-medium">
            End Date & Time
          </label>

          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) =>
              setEndDate(e.target.value)
            }
            className="w-full rounded-lg border border-border bg-background p-2"
            required
          />
        </div>

        {/* Banner Image */}
        <ImageUploader value={coverImage} onChange={setCoverImage} />

        {/* Ticket Section */}
        <div className="rounded-xl border border-border p-5">
          <h2 className="mb-4 text-xl font-semibold">
            Ticket Details
          </h2>

          {/* Ticket Name */}
          <div className="mb-4">
            <label className="mb-1 block font-medium">
              Ticket Name
            </label>

            <input
              type="text"
              value={ticketName}
              onChange={(e) =>
                setTicketName(e.target.value)
              }
              className="w-full rounded-lg border border-border bg-background p-2"
              placeholder="e.g. General, VIP"
              required
            />
          </div>

          {/* Ticket Description */}
          <div className="mb-4">
            <label className="mb-1 block font-medium">
              Ticket Description
            </label>

            <textarea
              value={ticketDescription}
              onChange={(e) =>
                setTicketDescription(e.target.value)
              }
              className="w-full rounded-lg border border-border bg-background p-2"
              placeholder="Optional ticket description"
              rows={3}
            />
          </div>

          {/* Ticket Price */}
          <div className="mb-4">
            <label className="mb-1 block font-medium">
              Ticket Price
            </label>

            <input
              type="number"
              value={ticketPrice}
              onChange={(e) =>
                setTicketPrice(e.target.value)
              }
              className="w-full rounded-lg border border-border bg-background p-2"
              placeholder="Enter ticket price"
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Ticket Quantity */}
          <div>
            <label className="mb-1 block font-medium">
              Number of Tickets
            </label>

            <input
              type="number"
              value={ticketQuantity}
              onChange={(e) =>
                setTicketQuantity(e.target.value)
              }
              className="w-full rounded-lg border border-border bg-background p-2"
              placeholder="e.g. 100"
              min="1"
              step="1"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-5 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </div>
  );
}