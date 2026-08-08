Eventify — Event Management & Ticketing Platform

A full-stack platform for creating events, selling tickets, and validating entry via QR codes.

🔗 Live Demo

App: https://event-booking-platform-neon.vercel.app 
Repo: https://github.com/Shubhi-Kumari-dev/event-booking-platform

🔑 Demo Accounts
Role	Email	Password
Organizer	organizer@demo.com	Password123!
Attendee	attendee@demo.com	Password123!
🚀 Tech Stack
Framework: Next.js 16 (App Router), TypeScript
Styling: Tailwind CSS v4, shadcn/ui (Base UI primitives)
Database: PostgreSQL (Neon), Prisma ORM
Auth: Auth.js v5 (Credentials Provider), bcrypt, JWT sessions
Media: Cloudinary (image uploads)
Email: Resend
Validation: Zod (client + server)
QR: qrcode (generation), html5-qrcode (camera scanning)
Animation: Framer Motion
Charts: Recharts
📦 Project Setup
bash
git clone <repository-url>
cd event-booking-platform
npm install
cp .env.example .env

Fill in .env:

DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
Neon Database
DATABASE_URL → pooled connection (used at runtime)
DIRECT_URL → direct connection (used for migrations)

This avoids connection-reset issues that pooled connections can cause during prisma migrate.

✅ Correctness Requirements — How We Handled Them
1. No Overselling

Bookings run inside a Prisma transaction using a conditional updateMany (quantitySold: { lte: quantity - requestedQty }-style guard) instead of a check-then-write read/write pair. If two attendees hit the last seats simultaneously, only one updateMany call succeeds in reducing quantitySold within capacity — the second fails the conditional update and the booking is rejected, so total tickets sold can never exceed TicketType.quantity.

2. Tamper-Proof Tickets

Each Ticket gets a unique, non-sequential qrCode value (not an incrementing integer), generated at booking time and stored server-side. The QR image encodes this opaque code, not the raw ticket/booking ID. Verification (POST /api/tickets/verify) looks the ticket up by this code, not by trusting any payload structure from the client — a forged or edited QR simply won't match a row, returning NOT_FOUND.

3. Idempotent Check-in

Ticket.status transitions VALID → USED on a successful scan, with checkedInAt timestamped. A second scan of the same ticket sees status === USED and returns ALREADY_USED (with the original check-in time) instead of re-processing — so attendance is never double-counted.

4. Query Efficiency

The events listing endpoint (GET /api/events) uses a single Prisma query with include for related ticketTypes, avoiding N+1 lookups per event. The database is seeded with 200+ events, and pagination (page/limit, default 12/page) ensures the endpoint never returns the full dataset in one response.

Known tradeoff: price sorting (sortBy=priceAsc|priceDesc) is applied in-memory on the current page post-fetch, since minimum ticket price lives on a related table and isn't directly sortable at the DB level in the MVP schema. At larger scale this would move to a denormalized minPrice column, raw SQL, or a materialized view.

5. Safe Deletes

Deleting an event checks for existing bookings first:

No bookings → hard delete.
Has bookings → soft delete (deletedAt populated, status set to CANCELLED) instead of removing the row — this preserves booking/ticket history rather than orphaning or silently destroying it.
🗂 Database Relationships
User
 ├── Events (as Organizer)
 └── Bookings (as Attendee)

Event
 ├── TicketTypes
 └── Bookings

Booking
 ├── Tickets
 └── Payment (simulated — see note below)

Note on paymentStatus: the schema uses a Booking.status field (PENDING / CONFIRMED / CANCELLED / REFUNDED) rather than a separate paymentStatus field. Functionally it serves the same purpose — payment is simulated, no real gateway is integrated — but the field is not literally named paymentStatus.

📡 API Overview
Endpoint	Method	Access
/api/auth/register	POST	Public
/api/auth/[...nextauth]	GET, POST	Public
/api/users/me	GET	Authenticated
/api/events	GET	Public
/api/events	POST	Organizer
/api/events/[id]	GET	Public
/api/events/[id]	PATCH	Organizer
/api/events/[id]	DELETE	Organizer
/api/bookings	GET, POST	Attendee
/api/bookings/[id]	GET, PATCH (cancel)	Booking Owner
/api/tickets/verify	POST	Organizer
/api/organizer/summary	GET	Organizer
/api/organizer/events	GET	Organizer
/api/organizer/events/[id]/stats	GET	Organizer
/api/upload	POST	Organizer

Role-based access is enforced server-side via requireRole() on every protected route — not just hidden in the UI.

✨ Features

Must-haves (per assignment spec):

 Registration + login (JWT sessions, bcrypt-hashed passwords)
 Two roles (Organizer / Attendee), server-enforced route access
 Event CRUD — create, edit, delete (Organizer, own events only)
 Draft / Published status — drafts hidden from public listing
 Public event discovery — search, category/city filters, date range, price sort, pagination
 Ticket booking — capacity-respecting, atomic, appears in attendee history
 QR ticket generation — unique per ticket, tamper-resistant
 View and download QR ticket from bookings page
 Check-in — camera scan + manual code entry, distinguishes Valid / Already Used / Wrong Event / Not Found
 Organizer dashboard — Total Events, Tickets Sold, Total Revenue, Check-in Rate, recent bookings table, upcoming events list

Bonus features shipped:

 Booking cancellation (capacity correctly returned to the pool)
 Dark mode
 Banner image upload (Cloudinary)
 Responsive layout (including check-in screen)

Bonus features not attempted:

 Email notifications — wired via Resend but not fully tested end-to-end
 CSV export of attendees
 Calendar invite (.ics) on booking
 Wishlist / saved events
 Charts on organizer dashboard (revenue/bookings over time)
🚧 Currently Working On / Known Limitations

Being transparent about what's incomplete at submission time:

Admin role/dashboard — the ADMIN role exists in the schema and is honored by requireRole() checks, but no dedicated admin UI has been built. Out of scope given time constraints.
Rate limiting — not implemented on any endpoint (e.g. login, booking).
Booking idempotency key — a duplicate rapid-fire booking request from the same client isn't deduplicated by an idempotency key (the atomic seat-lock transaction still prevents overselling, but the same user could theoretically create two separate bookings by double-submitting).
ESLint cleanup in progress — a few non-blocking no-explicit-any / no-img-element / no-unused-vars warnings are being cleaned up; none affect runtime behavior or tsc --noEmit (which passes with zero errors).
Ticket type editing — the Edit Event form updates event-level fields (title, venue, dates, banner, status); editing individual ticket type price/quantity after creation is not yet supported through the UI.
🛠 Development Commands
bash
npx prisma generate                          # generate Prisma client
npx prisma migrate dev --name migration_name  # create a migration
npx prisma db seed                            # seed database
npm run dev                                   # start dev server
npx tsc --noEmit                              # type-check
🧪 Manual Testing Reference
bash
GET /api/events
GET /api/events?sortBy=priceAsc
GET /api/events?sortBy=priceDesc
GET /api/events?sortBy=newest
GET /api/events?startDateFrom=2026-08-01&startDateTo=2026-12-31
GET /api/events?minPrice=500&maxPrice=2000
POST /api/tickets/verify
GET /api/organizer/summary
GET /api/organizer/events
GET /api/organizer/events/{id}/stats
🔮 Future Improvements
Rate limiting (e.g. per-IP on auth + booking endpoints)
Booking idempotency keys
Redis caching for hot event listing queries
Denormalized minPrice for true DB-level price sorting at scale
Payment gateway integration
Admin dashboard
Refund workflow

Developed as a Full Stack Event Management & Ticketing Platform assignment using Next.js, Prisma, PostgreSQL, and Auth.js.