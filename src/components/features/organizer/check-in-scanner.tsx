"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle2, XCircle, AlertTriangle, Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyTicket, type VerifyTicketResponse } from "@/services/tickets";
import { ApiError } from "@/lib/api"; // ← yeh line delete karo agar unused hai
import { cn } from "@/lib/utils";

const SCANNER_ID = "qr-check-in-scanner";

export function CheckInScanner({ eventId }: { eventId: string }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerifyTicketResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleVerify(code: string) {
  if (!code.trim() || loading) return;
  setLoading(true);
  setErrorMsg(null);
  try {
    const res = await verifyTicket(code.trim(), eventId);
    setResult(res);
  } catch {
    setErrorMsg("Verification failed. Check your connection and try again.");
    setResult(null);
  } finally {
    setLoading(false);
  }
}

  async function startScanning() {
    setResult(null);
    setErrorMsg(null);
    try {
      const scanner = new Html5Qrcode(SCANNER_ID);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await scanner.pause(true);
          await handleVerify(decodedText);
        },
        undefined
      );
      setScanning(true);
    } catch {
      setErrorMsg("Could not access camera. Use manual entry below instead.");
      setScanning(false);
    }
  }

  async function stopScanning() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // ignore stop errors
      }
    }
    setScanning(false);
  }

  async function resumeScanning() {
    setResult(null);
    setErrorMsg(null);
    if (scannerRef.current) {
      try {
        await scannerRef.current.resume();
      } catch {
        await startScanning();
      }
    }
  }

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div id={SCANNER_ID} className="aspect-square w-full bg-muted" />
      </div>

      <div className="flex justify-center">
        {scanning ? (
          <Button variant="outline" onClick={stopScanning}>
            <CameraOff className="mr-1.5 size-4" />
            Stop camera
          </Button>
        ) : (
          <Button onClick={startScanning}>
            <Camera className="mr-1.5 size-4" />
            Start camera
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or enter manually</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify(manualCode);
        }}
        className="flex gap-2"
      >
        <Input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          placeholder="Paste ticket QR code"
          className="font-mono"
        />
        <Button type="submit" disabled={loading}>
          Verify
        </Button>
      </form>

      {errorMsg && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {result && (
        <ResultCard result={result} onScanNext={resumeScanning} />
      )}
    </div>
  );
}

function ResultCard({
  result,
  onScanNext,
}: {
  result: VerifyTicketResponse;
  onScanNext: () => void;
}) {
  const config = {
    VALID: {
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-500",
      bg: "bg-green-500/10 border-green-500/30",
      label: "Valid — Entry granted",
    },
    ALREADY_USED: {
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/30",
      label: "Already used",
    },
    WRONG_EVENT: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/30",
      label: "Wrong event",
    },
    CANCELLED: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/30",
      label: "Ticket cancelled",
    },
    NOT_FOUND: {
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/30",
      label: "Ticket not found",
    },
  }[result.result];

  const Icon = config.icon;

  return (
    <div className={cn("space-y-3 rounded-xl border p-5 text-center", config.bg)}>
      <Icon className={cn("mx-auto size-12", config.color)} />
      <p className={cn("text-lg font-semibold", config.color)}>{config.label}</p>
      {result.attendee && (
        <p className="text-sm text-muted-foreground">
          {result.attendee.name} · {result.attendee.email}
        </p>
      )}
      <Button onClick={onScanNext} className="mt-2 w-full">
        Scan next ticket
      </Button>
    </div>
  );
}