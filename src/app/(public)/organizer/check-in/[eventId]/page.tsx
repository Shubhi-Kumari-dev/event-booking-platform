import { CheckInScanner } from "@/components/features/organizer/check-in-scanner";

interface CheckInPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function CheckInPage({ params }: CheckInPageProps) {
  const { eventId } = await params;
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Check-in scanner</h1>
      <p className="mt-1 text-muted-foreground">Scan attendee QR codes to verify entry.</p>
      <div className="mt-8">
        <CheckInScanner eventId={eventId} />
      </div>
    </div>
  );
}