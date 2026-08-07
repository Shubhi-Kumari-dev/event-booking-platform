export function formatPrice(amount: string | number): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatEventDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatEventTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function lowestPrice(ticketTypes: { price: string }[]): number {
  if (ticketTypes.length === 0) return 0;
  return Math.min(...ticketTypes.map((t) => parseFloat(t.price)));
}

export function totalAvailable(ticketTypes: { quantity: number; quantitySold: number }[]): number {
  return ticketTypes.reduce((sum, t) => sum + (t.quantity - t.quantitySold), 0);
}