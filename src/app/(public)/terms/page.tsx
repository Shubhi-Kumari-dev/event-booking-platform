export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: October 2026</p>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Eventify, you agree to be bound by these Terms of Service and all
            applicable laws and regulations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Ticketing and Bookings</h2>
          <p>
            All ticket purchases are subject to availability and event capacity limits. Eventify
            enforces transactional consistency to ensure tickets are never oversold. Tickets are issued
            with a unique cryptographic HMAC-SHA256 QR code for venue verification.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. Organizer Responsibilities</h2>
          <p>
            Organizers are solely responsible for setting ticket prices, event descriptions, schedules,
            and managing venue gate check-ins using the Eventify QR scanner.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">4. Refunds and Cancellations</h2>
          <p>
            Refund policies are determined by individual event organizers. In the event of an event
            cancellation, organizers must notify ticket holders.
          </p>
        </section>
      </div>
    </main>
  );
}
