import type { ApiResponse } from "@/types";

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

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Browser: always use relative URL to stay same-origin and avoid CORS
    return "";
  }
  // Server (SSR / Server Components): Node fetch requires absolute URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...init } = options;

  const baseUrl = getBaseUrl();
  let url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.set(key, String(value));
      }
    });

    const queryString = searchParams.toString();

    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  let json: ApiResponse<T>;

  try {
    json = await res.json();
  } catch {
    throw new ApiError(
      `Request failed with status ${res.status}`,
      res.status,
      "INVALID_RESPONSE"
    );
  }

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