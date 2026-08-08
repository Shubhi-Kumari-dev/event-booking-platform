"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";

interface UploadResponse {
  url: string;
  publicId?: string;
}

export function ImageUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setError("");
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const result = await apiFetch<UploadResponse>("/api/upload", {
        method: "POST",
        body: JSON.stringify({ image: base64 }),
      });
      onChange(result.url);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Upload failed. Please try again.");
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1 block font-medium">Banner Image</label>

      {value ? (
        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border">
          <Image src={value} alt="Event banner" fill className="object-cover" unoptimized />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex aspect-video w-full max-w-md flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background text-sm text-muted-foreground hover:bg-muted disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="size-6 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <ImagePlus className="size-6" />
              Click to upload banner image
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}