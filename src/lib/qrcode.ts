import QRCode from "qrcode";
import { randomBytes } from "crypto";
import { QR_TOKEN_PREFIX } from "@/lib/constants";

export function generateTicketToken(): string {
  const random = randomBytes(16).toString("hex");
  return `${QR_TOKEN_PREFIX}-${random}`;
}

export async function generateQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
  });
}