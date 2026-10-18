"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { AlertCircle, Calendar, MapPin, Link as LinkIcon, Upload, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/features/organizer/image-uploader";
import { EVENT_CATEGORIES, EVENT_STATUS } from "@/lib/constants";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(EVENT_CATEGORIES[0]);
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [coverImage, setCoverImage] = useState("");
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url");

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function toDatetimeLocal(iso: string) {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
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
        setCategory(event.category ?? EVENT_CATEGORIES[0]);
        setVenue(event.venue ?? "");
        setAddress(event.address ?? "");
        setCity(event.city ?? "");
        setStartDate(event.startDate ? toDatetimeLocal(event.startDate) : "");
        setEndDate(event.endDate ? toDatetimeLocal(event.endDate) : "");
        setStatus(event.status ?? "DRAFT");
        setCoverImage(event.coverImage ?? "");
        if (event.coverImage) {
          setImageInputMode("url");
        }
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
    setFieldErrors({});

    const startD = new Date(startDate);
    const endD = new Date(endDate);

    if (isNaN(startD.getTime())) {
      setError("Please select a valid start date & time.");
      setFieldErrors({ startDate: ["Invalid start date"] });
      setLoading(false);
      return;
    }

    if (isNaN(endD.getTime())) {
      setError("Please select a valid end date & time.");
      setFieldErrors({ endDate: ["Invalid end date"] });
      setLoading(false);
      return;
    }

    if (endD.getTime() <= startD.getTime()) {
      const msg = "End date & time must be strictly after the start date & time.";
      setError(msg);
      setFieldErrors({ endDate: [msg] });
      setLoading(false);
      return;
    }

    if (description.trim().length < 10) {
      const msg = "Description must be at least 10 characters long.";
      setError(msg);
      setFieldErrors({ description: [msg] });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          venue: venue.trim(),
          address: address.trim(),
          city: city.trim(),
          startDate: startD.toISOString(),
          endDate: endD.toISOString(),
          status,
          coverImage: coverImage.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errDetails = data?.error?.details?.fieldErrors;
        if (errDetails && typeof errDetails === "object") {
          setFieldErrors(errDetails);
          const detailList = Object.entries(errDetails)
            .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(", ") : errs}`)
            .join(" | ");
          throw new Error(`Validation failed: ${detailList}`);
        }

        throw new Error(
          data?.error?.message ||
            data?.message ||
            data?.error ||
            `Failed to update event (${response.status})`
        );
      }

      router.push("/organizer/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong updating the event.");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="space-y-4 rounded-xl border border-border p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight">Edit Event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update event schedule, venue, banner, or publication status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">{error}</p>
                {Object.keys(fieldErrors).length > 0 && (
                  <ul className="list-inside list-disc text-xs space-y-0.5 opacity-90">
                    {Object.entries(fieldErrors).map(([field, msgs]) => (
                      <li key={field}>
                        <span className="font-semibold capitalize">{field}:</span>{" "}
                        {Array.isArray(msgs) ? msgs.join(", ") : msgs}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-bold border-b border-border/60 pb-3">Event Details</h2>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Event Title <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
              minLength={3}
              maxLength={150}
              required
              className={fieldErrors.title ? "border-destructive" : ""}
            />
            {fieldErrors.title && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.title.join(", ")}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold">
                Description <span className="text-destructive">*</span>
              </label>
              <span
                className={`text-xs ${
                  description.length >= 10 ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                {description.length}/10 min characters
              </span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description..."
              rows={4}
              minLength={10}
              required
              className={`w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                fieldErrors.description ? "border-destructive" : "border-border"
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.description.join(", ")}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Publication Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={EVENT_STATUS.PUBLISHED}>Published (Live)</option>
                <option value={EVENT_STATUS.DRAFT}>Draft (Private)</option>
                <option value={EVENT_STATUS.CANCELLED}>Cancelled</option>
                <option value={EVENT_STATUS.COMPLETED}>Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Banner Section */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-lg font-bold">Cover Banner</h2>
            <div className="flex rounded-lg border border-border p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setImageInputMode("url")}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  imageInputMode === "url"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LinkIcon className="inline mr-1 size-3" /> Image URL
              </button>
              <button
                type="button"
                onClick={() => setImageInputMode("upload")}
                className={`rounded px-2.5 py-1 font-medium transition ${
                  imageInputMode === "upload"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Upload className="inline mr-1 size-3" /> Upload File
              </button>
            </div>
          </div>

          {imageInputMode === "url" ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className={fieldErrors.coverImage ? "border-destructive" : ""}
                />
                {coverImage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCoverImage("")}
                  >
                    Clear
                  </Button>
                )}
              </div>
              {fieldErrors.coverImage && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.coverImage.join(", ")}</p>
              )}
              {coverImage && (
                <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-xl border border-border shadow">
                  <Image
                    src={coverImage}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
          ) : (
            <ImageUploader value={coverImage} onChange={setCoverImage} />
          )}
        </div>

        {/* Schedule & Venue */}
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Calendar className="size-5 text-primary" />
            <h2 className="text-lg font-bold">Schedule & Venue</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Start Date & Time <span className="text-destructive">*</span>
              </label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className={fieldErrors.startDate ? "border-destructive" : ""}
              />
              {fieldErrors.startDate && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.startDate.join(", ")}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                End Date & Time <span className="text-destructive">*</span>
              </label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className={fieldErrors.endDate ? "border-destructive" : ""}
              />
              {fieldErrors.endDate && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.endDate.join(", ")}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Venue Name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Venue name"
                minLength={2}
                required
                className={`pl-9 ${fieldErrors.venue ? "border-destructive" : ""}`}
              />
            </div>
            {fieldErrors.venue && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.venue.join(", ")}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Address <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full address"
                minLength={2}
                required
                className={fieldErrors.address ? "border-destructive" : ""}
              />
              {fieldErrors.address && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.address.join(", ")}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                City <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                minLength={2}
                required
                className={fieldErrors.city ? "border-destructive" : ""}
              />
              {fieldErrors.city && (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.city.join(", ")}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/organizer/events")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="min-w-40 font-semibold">
            {loading ? (
              "Saving Changes..."
            ) : (
              <>
                <CheckCircle2 className="mr-2 size-4" /> Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}