"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DownloadQrButton({ qrDataUrl, qrCode }: { qrDataUrl: string; qrCode: string }) {
  function handleDownload() {
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `ticket-${qrCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDownload}>
      <Download className="mr-1.5 size-3.5" />
      Download
    </Button>
  );
}