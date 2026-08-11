import type { ApiResponse } from "@/types";

// Browser: use same-origin relative URLs.
// Server: use NEXT_PUBLIC_APP_URL when an absolute URL is required.
const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_APP_URL ?? ""
    : "";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    code: string,
    details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...init } = options;

  // Browser requests stay on the current Vercel domain.
  // This prevents CORS problems between different Vercel deployment URLs.
  const url = path.startsWith("http")
    ? path
    : `${BASE_URL}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });

    const qs = searchParams.toString();

    if (qs) {
      const separator = url.includes("?") ? "&" : "?";
      return fetch(`${url}${separator}${qs}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...init.headers,
        },
      }).then(async (res) => {
        const json: ApiResponse<T> = await res.json();

        if (!json.success) {
          throw new ApiError(
            json.error.message,
            res.status,
            json.error.code,
            json.error.details
          );
        }

        return json.data;
      });
    }
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new ApiError(
      json.error.message,
      res.status,
      json.error.code,
      json.error.details
    );
  }

  return json.data;
}