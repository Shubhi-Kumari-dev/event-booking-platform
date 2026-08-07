export const ROLES = {
  ADMIN: "ADMIN",
  ORGANIZER: "ORGANIZER",
  ATTENDEE: "ATTENDEE",
} as const;

export const EVENT_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export const TICKET_STATUS = {
  VALID: "VALID",
  USED: "USED",
  CANCELLED: "CANCELLED",
} as const;

export const EVENT_CATEGORIES = [
  "Technology",
  "Music",
  "Business",
  "Sports",
  "Arts",
  "Food & Drink",
  "Health & Wellness",
  "Education",
  "Networking",
  "Comedy",
] as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
};

export const QR_TOKEN_PREFIX = "EVT-TKT";

export const COOKIE_NAMES = {
  SESSION: "authjs.session-token",
};