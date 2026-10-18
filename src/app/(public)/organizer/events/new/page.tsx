"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Tag,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Link as LinkIcon,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/features/organizer/image-uploader";
import { EVENT_CATEGORIES, EVENT_STATUS } from "@/lib/constants";

interface TicketTypeState {
  id: string;
  name: string;
  description: string;
  price: string;
  quantity: string;
}

const PRESET_BANNERS = [
  {
    label: "Tech Conference",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600&auto=format&fit=crop&q=80",
  },
  {
    label: "Music Festival",
    url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&auto=format&fit=crop&q=80",
  },
  {
    label: "Business Summit",
    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1600&auto=format&fit=crop&q=80",
  },
  {
    label: "Art & Design",
    url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1600&auto=format&fit=crop&q=80",
  },
];

function getDefaultDates() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(14, 0, 0, 0);

  const pad = (n: number) => String(n).padStart(2, "0");
  const toLocalString = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return {
    start: toLocalString(tomorrow),
    end: toLocalString(tomorrowEnd),
  };
}

export default function NewEventPage() {
  const router = useRouter();
  const defaultDates = getDefaultDates();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(EVENT_CATEGORIES[0]);
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [status, setStatus] = useState<string>(EVENT_STATUS.PUBLISHED);

  const [coverImage, setCoverImage] = useState("");
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url");

  const [ticketTypes, setTicketTypes] = useState<TicketTypeState[]>([
    {
      id: "1",
      name: "General Admission",
      description: "Standard entry ticket",
      price: "499",
      quantity: "100",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function addTicketType() {
    setTicketTypes((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        name: prev.length === 1 ? "VIP Pass" : `Tier ${prev.length + 1}`,
        description: "",
        price: "999",
        quantity: "50",
      },
    ]);
  }

  function removeTicketType(id: string) {
    if (ticketTypes.length <= 1) return;
    setTicketTypes((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTicketType(id: string, field: keyof TicketTypeState, value: string) {
    setTicketTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    // Client-side date check
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

    // Validate ticket types
    for (const [index, t] of ticketTypes.entries()) {
      if (!t.name.trim()) {
        const msg = `Ticket tier #${index + 1} must have a name.`;
        setError(msg);
        setLoading(false);
        return;
      }
      const qty = parseInt(t.quantity, 10);
      if (isNaN(qty) || qty <= 0) {
        const msg = `Ticket tier "${t.name}" quantity must be at least 1.`;
        setError(msg);
        setLoading(false);
        return;
      }
      const price = parseFloat(t.price);
      if (isNaN(price) || price < 0) {
        const msg = `Ticket tier "${t.name}" price must be 0 (free) or more.`;
        setError(msg);
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
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
        ticketTypes: ticketTypes.map((t) => ({
          name: t.name.trim(),
          description: t.description.trim() || undefined,
          price: parseFloat(t.price) || 0,
          quantity: parseInt(t.quantity, 10) || 1,
        })),
      };

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
            `Failed to create event (${response.status})`
        );
      }

      router.push("/organizer/events");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong creating the event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight">Create New Event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Publish your event to thousands of attendees on Eventify.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Top Error Alert */}
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

        {/* Section 1: Basic Information */}
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Sparkles className="size-5 text-primary" />
            <h2 className="text-lg font-bold">1. Event Overview</h2>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Event Title <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NextGen Web Summit 2026"
              minLength={3}
              maxLength={150}
              required
              className={fieldErrors.title ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {fieldErrors.title ? (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.title.join(", ")}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">3 to 150 characters</p>
            )}
          </div>

          {/* Description */}
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
              placeholder="Provide a detailed description of what attendees can expect, keynotes, schedule, and takeaways..."
              rows={4}
              minLength={10}
              required
              className={`w-full rounded-lg border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                fieldErrors.description
                  ? "border-destructive focus:ring-destructive"
                  : "border-border"
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.description.join(", ")}</p>
            )}
          </div>

          {/* Category & Status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Category <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">Publish Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={EVENT_STATUS.PUBLISHED}>Published (Visible on Discover page)</option>
                <option value={EVENT_STATUS.DRAFT}>Draft (Private to organizer)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Banner Image */}
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <h2 className="text-lg font-bold">2. Cover Banner</h2>
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
                <LinkIcon className="inline mr-1 size-3" /> Image URL / Presets
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
              <div>
                <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                  Paste Direct Image URL
                </label>
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
                  <p className="mt-1 text-xs text-destructive">
                    {fieldErrors.coverImage.join(", ")}
                  </p>
                )}
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  Or pick a curated banner preset:
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_BANNERS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCoverImage(preset.url)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        coverImage === preset.url
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
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

        {/* Section 3: Date, Time & Venue */}
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Calendar className="size-5 text-primary" />
            <h2 className="text-lg font-bold">3. Schedule & Location</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Start Date */}
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

            {/* End Date */}
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
              {fieldErrors.endDate ? (
                <p className="mt-1 text-xs text-destructive">{fieldErrors.endDate.join(", ")}</p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">Must be after Start Date</p>
              )}
            </div>
          </div>

          {/* Venue & Location */}
          <div className="space-y-4 pt-2">
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
                  placeholder="e.g. Pragati Maidan / Grand Hyatt Ballroom"
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
                  placeholder="e.g. Mathura Road, Railway Colony"
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
                  placeholder="e.g. New Delhi"
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
        </div>

        {/* Section 4: Ticket Tiers */}
        <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h2 className="text-lg font-bold">4. Ticket Tiers</h2>
              <p className="text-xs text-muted-foreground">
                Define ticket options (e.g. General Admission, VIP Pass, Early Bird).
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTicketType}
              className="gap-1.5"
            >
              <Plus className="size-4" /> Add Ticket Tier
            </Button>
          </div>

          <div className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <div
                key={ticket.id}
                className="relative space-y-4 rounded-xl border border-border/80 bg-background/50 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Tier #{index + 1}
                  </span>
                  {ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTicketType(ticket.id)}
                      className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label className="mb-1 block text-xs font-semibold">Ticket Name *</label>
                    <Input
                      type="text"
                      value={ticket.name}
                      onChange={(e) => updateTicketType(ticket.id, "name", e.target.value)}
                      placeholder="e.g. General, VIP"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">Price (INR) *</label>
                    <Input
                      type="number"
                      value={ticket.price}
                      onChange={(e) => updateTicketType(ticket.id, "price", e.target.value)}
                      placeholder="0 for free"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold">Quantity Available *</label>
                    <Input
                      type="number"
                      value={ticket.quantity}
                      onChange={(e) => updateTicketType(ticket.id, "quantity", e.target.value)}
                      placeholder="e.g. 100"
                      min="1"
                      step="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Perks & Notes (Optional)
                  </label>
                  <Input
                    type="text"
                    value={ticket.description}
                    onChange={(e) => updateTicketType(ticket.id, "description", e.target.value)}
                    placeholder="e.g. Includes conference kit and catered networking lunch"
                    maxLength={500}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/organizer/events")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="min-w-44 font-semibold"
          >
            {loading ? (
              "Creating Event..."
            ) : (
              <>
                <CheckCircle2 className="mr-2 size-4" />
                {status === EVENT_STATUS.PUBLISHED ? "Publish Event" : "Save as Draft"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}