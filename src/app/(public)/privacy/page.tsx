export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: October 2026</p>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">1. Information We Collect</h2>
          <p>
            When registering or booking tickets on Eventify, we collect your name, email address, and
            booking details. Passwords are securely hashed with bcrypt.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">2. Ticket Security & QR Validation</h2>
          <p>
            QR code tokens contain signed hashes that prove authenticity without exposing sensitive
            financial data. They are verified offline or online by event staff.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">3. Data Sharing</h2>
          <p>
            Your name and booking references are made available to the specific event organizer for door
            check-in and venue capacity management. We do not sell your personal data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-foreground">4. Contact Us</h2>
          <p>
            If you have questions about your personal data or wish to delete your account, contact our
            support team at support@eventify.local.
          </p>
        </section>
      </div>
    </main>
  );
}
