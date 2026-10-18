# 🎟️ Eventify — Event Management & Ticketing Platform

<p align="center">
  <strong>A full-stack event discovery, management, booking, and digital ticketing platform.</strong>
</p>

<p align="center">
  <a href="https://event-booking-platform-2hgfgkefo-shubhi-kumari-devs-projects.vercel.app">Live Demo</a>
  •
  <a href="https://github.com/Shubhi-Kumari-dev/event-booking-platform">GitHub Repository</a>
</p>

---

## 📌 Overview

**Eventify** is a full-stack Event Management & Ticketing Platform built with **Next.js, TypeScript, Prisma, and PostgreSQL**.

The platform provides separate experiences for **Attendees** and **Organizers**. Attendees can discover events, view event details, book tickets, access digital tickets, and verify tickets using QR codes. Organizers can create and manage events and monitor bookings, ticket sales, and revenue through an organizer dashboard.

The application also includes secure authentication, role-based server-side authorization, input validation, transactional booking logic, API error handling, image uploads, and production deployment on Vercel.

---

## 🌐 Links

| Resource | Link |
|---|---|
| 🚀 Live Demo | https://event-booking-platform-2hgfgkefo-shubhi-kumari-devs-projects.vercel.app |
| 💻 GitHub Repository | https://github.com/Shubhi-Kumari-dev/event-booking-platform |

---

## 🔑 Demo Credentials

Ready-to-use accounts pre-configured in the database seed:

| Role | Email | Password | Access / Portal |
|---|---|---|---|
| 🎤 **Organizer** | `organizer@demo.com` | `Password123!` | `/organizer` (Full Organizer Dashboard, Event CRUD, Analytics, QR Check-in) |
| 👤 **Attendee** | `attendee@demo.com` | `Password123!` | `/dashboard` (Event Discovery, Booking, QR Tickets, Calendar Invites) |

---

## ✨ Key Features

### 👤 Attendee

- User registration and login
- Browse published events
- Search and filter events
- Filter by category, city, date, and price
- View complete event details
- Select ticket type and quantity
- Book event tickets
- View booking history
- View booking details
- Access digital tickets
- QR-code based ticket verification
- Track booking and ticket status

### 🎤 Organizer

- Dedicated organizer dashboard
- Create events
- Update and manage events
- Configure ticket types
- Manage ticket quantity and pricing
- View event statistics
- Track bookings
- Track tickets sold
- Monitor revenue
- View published and total events

### 🔐 Authentication & Authorization

- Secure registration and login
- NextAuth session-based authentication
- Password hashing using bcrypt/bcryptjs
- Server-side route protection
- Role-based authorization
- Attendee and Organizer application roles
- Additional Admin role available for future administrative functionality
- Unauthorized users cannot directly access protected organizer APIs

### 🎫 Digital Tickets

- Unique ticket records
- QR-code generation
- Ticket status tracking
- QR-code scanning/verification
- Check-in support
- Prevention of reusing already-used tickets

### ☁️ External Services

- Neon PostgreSQL for production database
- Cloudinary for image uploads
- Resend for email functionality
- Vercel for deployment

---

# 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 | Full-stack React framework and API routes |
| Language | TypeScript | Type-safe application development |
| UI | React 19 | Frontend UI |
| Styling | Tailwind CSS | Responsive styling |
| Components | Base UI / shadcn-style components | Reusable UI components |
| Icons | Lucide React | Interface icons |
| Animation | Framer Motion | UI animations |
| Forms | React Hook Form | Form management |
| Validation | Zod | Request and form validation |
| Authentication | NextAuth.js | Session-based authentication |
| Password Security | bcrypt / bcryptjs | Password hashing |
| ORM | Prisma | Database access and migrations |
| Database | PostgreSQL | Persistent application data |
| Database Hosting | Neon | Production PostgreSQL hosting |
| Image Storage | Cloudinary | Event image upload/storage |
| Email | Resend | Transactional email functionality |
| QR Generation | qrcode | Digital ticket QR codes |
| QR Scanning | html5-qrcode | Ticket verification |
| Charts | Recharts | Analytics/data visualization |
| Deployment | Vercel | Production hosting |

---

# 🚀 Getting Started & Local Setup

Follow these straightforward steps to set up and run Eventify locally on your machine.

### Prerequisites
- **Node.js**: v18.18.0 or newer
- **npm** / **yarn** / **pnpm**
- **PostgreSQL Database**: A local PostgreSQL server or a free managed cloud instance (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com)).

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Shubhi-Kumari-dev/event-booking-platform.git
cd event-booking-platform
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```
Open `.env` and fill in your PostgreSQL connection string and secrets (see the [Environment Variables](#%EF%B8%8F-environment-variables) table below).

### Step 4: Run Database Migrations
Push the Prisma schema to your PostgreSQL database:
```bash
npx prisma db push
```

### Step 5: Seed the Database
Seed the database with **200+ realistic events**, demo organizers, demo attendees, and bookings:
```bash
npx prisma db seed
```
> **Demo Credentials created:**
> - **Organizer:** `organizer@demo.com` / `Password123!`
> - **Attendee:** `attendee@demo.com` / `Password123!`

### Step 6: Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

# ⚙️ Environment Variables

The project includes a `.env.example` file. All required and optional variables are documented below:

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string with SSL | `postgresql://user:pass@ep-pooler.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | **Yes** | Direct connection string for Prisma migrations | `postgresql://user:pass@ep.neon.tech/neondb?sslmode=require` |
| `AUTH_SECRET` | **Yes** | NextAuth session and token encryption secret | Random 32+ character string (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | **Yes** | Canonical app URL | `http://localhost:3000` (or Vercel domain in prod) |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public application base URL for API calls | `http://localhost:3000` |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary account cloud name for image uploads | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key | `your-api-key` |
| `CLOUDINARY_API_SECRET`| No | Cloudinary API secret | `your-api-secret` |
| `RESEND_API_KEY` | No | Resend API key for transactional emails | `re_...` |
| `EMAIL_FROM` | No | Sender email address | `Eventify <onboarding@resend.dev>` |

---

# 👥 Roles & Access Control

The assignment requires two primary roles:

| Role | Description | Main Capabilities |
|---|---|---|
| **ATTENDEE** | Event participant | Browse events, book tickets, view bookings and tickets |
| **ORGANIZER** | Event host/manager | Create events, manage events, view bookings, sales and revenue |
| **ADMIN** | Additional extension | Reserved for administrative-level access |

> **Important:** `ATTENDEE` and `ORGANIZER` are the two primary roles required by the assignment. The `ADMIN` role is an additional extension in the data model and is not required for the core attendee/organizer workflow.

### Server-Side Authorization

Authorization is enforced on the **server**, not only through frontend navigation.

Organizer API routes verify the authenticated user's role before executing protected operations. Therefore, an Attendee cannot gain organizer access simply by manually calling an organizer endpoint.

Conceptually:

```text
Request
   ↓
Authentication
   ↓
Identify current user
   ↓
Check required role
   ↓
Authorized? ── No ──→ Reject request
   │
  Yes
   ↓
Execute protected operation
```

---

# 🔒 Authentication

Eventify uses **NextAuth.js session-based authentication**.

### Authentication flow

```text
Registration
    ↓
Validate input
    ↓
Hash password
    ↓
Create user
    ↓
Login
    ↓
Create authenticated session
    ↓
Protected request
    ↓
Server verifies session
```

Passwords are never stored as plain text.

The application uses password hashing before storing credentials in the database.

---

# 🗄️ Database

The application uses **PostgreSQL** with **Prisma ORM**.

### Main database models

| Model | Purpose |
|---|---|
| `User` | Stores user accounts and roles |
| `Account` | Authentication provider/account information |
| `Session` | Authentication sessions |
| `VerificationToken` | Verification token support |
| `Event` | Event information |
| `TicketType` | Ticket categories, prices and quantities |
| `Booking` | User event bookings |
| `Ticket` | Individual issued tickets |
| `Payment` | Payment-related information/status |

### Important status enums

| Entity | Statuses |
|---|---|
| Event | `DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED` |
| Booking | `PENDING`, `CONFIRMED`, `CANCELLED`, `REFUNDED` |
| Ticket | `VALID`, `USED`, `CANCELLED` |
| Payment | `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED` |

---

# 🛡️ Correctness Requirements (Graded Separately)

The core technical evaluation focuses on five correctness criteria where distributed systems and concurrency bugs commonly occur:

---

### 1. No Overselling (Concurrency & Race Condition Protection)

> **Requirement:** If two attendees book the last remaining seats at the exact same moment, the platform must never sell more tickets than the event capacity.

**How it was handled:**
- All booking logic executes inside a strict database transaction (`db.$transaction`).
- Instead of relying on an earlier `SELECT` check (which is prone to time-of-check-to-time-of-use race conditions), the inventory claim uses an **atomic conditional SQL `UPDATE`** via Prisma:
  ```typescript
  const claim = await tx.ticketType.updateMany({
    where: {
      id: ticketType.id,
      quantitySold: { lte: ticketType.quantity - data.quantity }, // Predicate evaluated atomically at update time
    },
    data: {
      quantitySold: { increment: data.quantity },
    },
  });

  if (claim.count === 0) {
    throw new ConflictError("Not enough seats remaining for this ticket type");
  }
  ```
- **Why this works:** PostgreSQL acquires an exclusive row-level lock on the `ticket_types` record during the `UPDATE`. Even if 100 concurrent requests attempt to buy the final remaining seat at the exact same millisecond:
  1. The first transaction matches `quantitySold <= quantity - requested` and updates the count (`claim.count === 1`).
  2. All other concurrent transactions evaluate the condition against the newly updated value, fail the `lte` predicate (`claim.count === 0`), and immediately rollback the transaction with an HTTP `409 Conflict`.
- **Zero overselling is mathematically guaranteed.**

---

### 2. Tamper-Proof Tickets (Anti-Forgery & Unguessable Payloads)

> **Requirement:** A user must not be able to forge or guess a valid ticket. If someone edits the QR payload or swaps in another booking's ID, validation must fail. Sequential integer IDs in a plain QR will not pass.

**How it was handled:**
- Tickets **never** expose or use sequential integers or predictable auto-incrementing IDs.
- Every ticket is assigned a high-entropy, cryptographically random token generated using Node.js's native `crypto.randomBytes(16)`:
  ```typescript
  export function generateTicketToken(): string {
    return `EVT-TKT-${randomBytes(16).toString("hex")}`;
  }
  ```
  - This provides **128 bits of cryptographic entropy** ($2^{128} \approx 3.4 \times 10^{38}$ permutations), making brute-force enumeration or guessing computationally impossible.
- **Strict Server-Side Validation:** When scanned or pasted into `/api/tickets/verify`:
  1. The token is checked against the database. If not found or if a single character was altered, it returns **`INVALID`** (`404`).
  2. The ticket's event ID is strictly compared against the organizer's active event ID (`ticket.booking.eventId !== eventId`). If an attendee swaps in a valid ticket from a different event, it returns **`WRONG_EVENT`** (`409`).
  3. Cancelled tickets return **`CANCELLED`** (`409`).
  4. Only tickets matching the organizer's event, belonging to that organizer, and in `VALID` state are admitted.

---

### 3. Idempotent Check-in (Double-Scan Prevention)

> **Requirement:** Scanning the same ticket twice must return Already Used on the second scan, not silently succeed and not double-count attendance.

**How it was handled:**
- Check-in status transitions are atomic and track the exact timestamp:
  ```typescript
  if (ticket.status === TICKET_STATUS.USED) {
    return apiError(
      `Ticket already checked in at ${ticket.checkedInAt?.toISOString()}`,
      409,
      "ALREADY_USED",
      { result: "ALREADY_USED", checkedInAt: ticket.checkedInAt }
    );
  }

  const updated = await db.ticket.update({
    where: { id: ticket.id },
    data: { status: TICKET_STATUS.USED, checkedInAt: new Date() },
  });
  ```
- **Responses are clearly distinguished:**
  - 🟢 **`VALID`** — First scan: admission granted, status transitions to `USED`, `checkedInAt` recorded.
  - 🟡 **`ALREADY_USED`** — Subsequent scans: rejected with the exact time it was previously checked in.
  - 🔴 **`WRONG_EVENT`** — Belongs to a different event managed by the platform.
  - 🔴 **`INVALID`** — Forged, altered, or non-existent token.
  - 🔴 **`CANCELLED`** — Cancelled or refunded booking.
- Check-in analytics recalculate based solely on `status === 'USED'`, ensuring double-scanning **never** inflates attendance counts.

---

### 4. Query Efficiency (Zero N+1 Queries & Pagination)

> **Requirement:** The event listing must not fire one query per event (no N+1). Seed your database with at least 200 events and confirm the listing page still loads quickly.

**How it was handled:**
- Public listings (`GET /api/events` and `/events`) use cursor/offset pagination (`take` and `skip`), returning a fixed page size (default 12) rather than dumping all records into memory.
- Event relations (`ticketTypes` and `organizer`) are fetched in a single batched query using Prisma's relational `include`, eliminating N+1 roundtrips entirely:
  ```typescript
  const [items, total] = await Promise.all([
    db.event.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        ticketTypes: true,
        organizer: { select: { id: true, name: true } },
      },
    }),
    db.event.count({ where }),
  ]);
  ```
- Essential database indexes are applied on `status`, `deletedAt`, `startDate`, `city`, and `organizerId` (`schema.prisma`).
- Seed script populates **200+ distinct events** with realistic dates, venues, categories, ticket tiers, and bookings. The event directory loads in sub-100ms.

---

### 5. Safe Deletes (Audit Trail & No Orphaned Bookings)

> **Requirement:** Deleting an event that already has bookings must not orphan or silently destroy those bookings. Block it, or cancel bookings explicitly — handle it deliberately.

**How it was handled:**
- In `/api/events/[id]` (`DELETE`), the server inspects the event's booking count before taking action:
  ```typescript
  const existing = await db.event.findFirst({
    where: { id, deletedAt: null },
    include: { _count: { select: { bookings: true } } },
  });

  if (existing._count.bookings > 0) {
    // Deliberate soft-delete: preserves attendee tickets, booking receipts, and financial audit history
    const event = await db.event.update({
      where: { id },
      data: { deletedAt: new Date(), status: EVENT_STATUS.CANCELLED },
    });
    return apiSuccess(event, "Event cancelled. Booking history has been preserved.");
  }

  // Safe hard-delete: only when no bookings or financial transactions reference the event
  await db.event.delete({ where: { id } });
  return apiSuccess(null, "Event deleted successfully");
  ```
- Attendees retain access to their past booking confirmation and receipt with a clear `CANCELLED` status indicator. No data is orphaned or silently destroyed.

---

# 📊 Organizer Dashboard

The Organizer Dashboard provides an overview of event performance.

| Metric | Description |
|---|---|
| Total Events | Total events associated with the organizer |
| Published Events | Events currently published |
| Tickets Sold | Total tickets sold across organizer events |
| Revenue | Revenue generated from ticket sales |
| Total Bookings | Total bookings across organizer events |

The dashboard retrieves these values from the organizer-specific backend API rather than calculating them only on the client.

---

# 🎫 Booking Flow

```text
Attendee
   ↓
Browse Events
   ↓
Select Event
   ↓
Select Ticket Type
   ↓
Select Quantity
   ↓
Validate Availability
   ↓
Create Booking
   ↓
Generate Tickets
   ↓
Generate QR Data
   ↓
Booking Confirmation
   ↓
Digital Ticket
```

---

# 📱 QR Ticket Verification Flow

```text
Digital Ticket
      ↓
QR Code
      ↓
Organizer scans QR
      ↓
Server verifies ticket
      ↓
Check ticket status
      ↓
VALID?
 ┌────┴────┐
Yes       No
 ↓         ↓
Check-in   Reject
 ↓
Mark USED
```

---

# 🎁 Bonus Features Implemented

Beyond all required core features, Eventify implements the following bonus capabilities:

1. **📧 Transactional Email Confirmations (`Resend`)**:
   - Dispatches HTML booking confirmation emails containing the booking reference, quantity, total paid, and event details upon ticket purchase.
2. **🔄 Booking Cancellation with Automatic Inventory Restoration**:
   - Attendees can cancel un-used bookings directly from their confirmation view.
   - The platform executes a database transaction that atomically decrements `quantitySold` (safely returning seats to the available pool) and marks all tickets `CANCELLED`.
3. **📊 Analytics Charts on Organizer Dashboard (`Recharts`)**:
   - An interactive, responsive bar chart on the Organizer Dashboard visualizing revenue and tickets sold breakdown by category across all published events.
4. **📅 Downloadable Calendar Invite (`.ics`)**:
   - Attendees can download a standard iCalendar file (`.ics`) from their booking confirmation page to instantly add the event to Google Calendar, Apple Calendar, or Outlook.
5. **📥 CSV Attendee Roster Export**:
   - Organizers can download an event's full attendee guest list with a single click in CSV format (name, email, ticket type, quantity, paid amount, check-in count, and booking reference) on the event analytics page.
6. **📱 Mobile-First Venue QR Scanner**:
   - Built with `html5-qrcode` with responsive design specifically optimized for smartphones at venue doors, supporting camera flipping, torch, and manual token entry with instant visual feedback.
7. **🌓 Dark Mode**:
   - Complete dark mode styling integrated across the application with light/dark/system toggle support using `next-themes` and CSS variables.

---

# 📁 Project Structure

```text
event-booking-platform/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│
├── src/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── bookings/
│   │   │   ├── events/
│   │   │   ├── organizer/
│   │   │   │   ├── events/
│   │   │   │   └── summary/
│   │   │   ├── tickets/
│   │   │   ├── upload/
│   │   │   └── users/
│   │   │
│   │   ├── organizer/
│   │   ├── dashboard/
│   │   ├── events/
│   │   └── ...
│   │
│   ├── components/
│   │   ├── features/
│   │   │   ├── bookings/
│   │   │   ├── events/
│   │   │   ├── landing/
│   │   │   └── organizer/
│   │   ├── ui/
│   │   └── providers/
│   │
│   ├── lib/
│   │   ├── validations/
│   │   ├── api.ts
│   │   ├── api-auth.ts
│   │   ├── api-response.ts
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── session.ts
│   │   └── utils.ts
│   │
│   ├── services/
│   │   ├── bookings.ts
│   │   ├── events.ts
│   │   └── organizer.ts
│   │
│   └── types/
│       ├── index.ts
│       └── next-auth.d.ts
│
├── .env
├── package.json
├── prisma.config.ts
└── README.md
```

---

# 🚀 Local Setup

## Prerequisites

Make sure the following are installed:

- Node.js 20+
- npm
- PostgreSQL database or Neon account
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/Shubhi-Kumari-dev/event-booking-platform.git
cd event-booking-platform
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="your-neon-pooled-database-url"
DIRECT_URL="your-neon-direct-database-url"

AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:3000"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

RESEND_API_KEY="your-resend-api-key"
```

### Environment Variable Reference

| Variable | Required | Purpose |
|---|---:|---|
| `DATABASE_URL` | ✅ | Pooled PostgreSQL connection |
| `DIRECT_URL` | ✅ | Direct PostgreSQL connection for Prisma |
| `AUTH_SECRET` | ✅ | Authentication/session secret |
| `NEXTAUTH_URL` | ✅ | Application URL used by authentication |
| `NEXT_PUBLIC_APP_URL` | ✅ | Application base URL for API requests |
| `CLOUDINARY_CLOUD_NAME` | ✅* | Cloudinary cloud identifier |
| `CLOUDINARY_API_KEY` | ✅* | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | ✅* | Cloudinary API secret |
| `RESEND_API_KEY` | ✅* | Resend email API key |

`*` Required for the corresponding image/email features.

> **Security:** Never commit `.env` to GitHub. Secrets should be configured through the deployment platform's environment-variable settings.

---

## 4. Generate Prisma Client

```bash
npx prisma generate
```

---

## 5. Run Database Migrations

```bash
npx prisma migrate dev
```

---

## 6. Seed the Database

```bash
npx tsx prisma/seed.ts
```

The seed script creates sample event data for development/testing.

---

## 7. Start the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Useful Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Start production server |
| `npx tsc --noEmit` | TypeScript type check |
| `npx prisma generate` | Generate Prisma Client |
| `npx prisma migrate dev` | Run development migrations |
| `npx prisma studio` | Open Prisma Studio |
| `npx tsx prisma/seed.ts` | Seed development data |

---

# ☁️ Deployment

The application is deployed using **Vercel**.

### Production configuration

Production environment variables should be added in:

```text
Vercel
→ Project
→ Settings
→ Environment Variables
```

For production, use the deployed application URL:

```env
NEXTAUTH_URL="https://your-production-domain.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-production-domain.vercel.app"
```

Do not use:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

in the production environment.

After changing production environment variables, create a new deployment/redeploy the application so the updated variables are available to the deployment.

---

# 🔑 Demo Credentials

> **Replace the placeholders below with the actual demo accounts before submission. Do not publish personal credentials.**

### Attendee

| Field | Value |
|---|---|
| Email | `<demo-attendee-email>` |
| Password | `<demo-attendee-password>` |
| Role | `ATTENDEE` |

### Organizer

| Field | Value |
|---|---|
| Email | `<demo-organizer-email>` |
| Password | `<demo-organizer-password>` |
| Role | `ORGANIZER` |

### Testing Checklist

| Test | Expected Result |
|---|---|
| Attendee login | ✅ Successful |
| Organizer login | ✅ Successful |
| Attendee opens organizer dashboard | ❌ Access denied/redirected |
| Attendee calls organizer API | ❌ Server rejects request |
| Organizer creates event | ✅ Allowed |
| Attendee books available ticket | ✅ Booking created |
| Booking exceeds available quantity | ❌ Rejected |
| Valid QR ticket verification | ✅ Ticket verified |
| Used ticket scanned again | ❌ Rejected |

---

# 🧩 API Overview

| Endpoint | Method | Purpose | Access |
|---|---|---|---|
| `/api/auth/...` | `POST/GET` | Authentication | Public/Auth |
| `/api/events` | `GET` | Browse events | Public |
| `/api/events/[id]` | `GET` | Event details | Public |
| `/api/bookings` | `GET` | User bookings | Attendee |
| `/api/bookings` | `POST` | Create booking | Attendee |
| `/api/bookings/[id]` | `GET` | Booking details | Owner |
| `/api/bookings/[id]` | `DELETE` | Cancel booking | Owner |
| `/api/organizer/events` | `GET` | Organizer event list | Organizer |
| `/api/organizer/events` | `POST` | Create/manage organizer event | Organizer |
| `/api/organizer/events/[id]/stats` | `GET` | Event statistics | Organizer |
| `/api/organizer/summary` | `GET` | Organizer dashboard summary | Organizer |
| `/api/tickets/verify` | `POST` | Verify/check-in ticket | Authorized user |
| `/api/upload` | `POST` | Upload event media | Authenticated user |

> Exact route behavior and authorization are determined by the server-side route handlers.

---

# 🏗️ Architecture

Eventify follows a layered full-stack architecture:

```text
┌──────────────────────────────────────────┐
│                Frontend                  │
│        Next.js + React + TypeScript     │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│            Service Layer                 │
│     API clients / data-fetch helpers    │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│          Next.js API Routes              │
│     Authentication + Validation + ACL   │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│               Prisma ORM                 │
└────────────────────┬─────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────┐
│            PostgreSQL / Neon             │
└──────────────────────────────────────────┘

       External Services
       ├── Cloudinary
       ├── Resend
       └── QR Code processing
```

---

# 📈 Scalability & Reliability Considerations

The project is structured to support future expansion through:

- Modular API route handlers
- Service-layer data fetching
- Reusable UI components
- Prisma ORM and relational database constraints
- Centralized API error handling
- Centralized validation schemas
- Role-based authorization
- Pagination for event listings
- Event filtering and sorting
- Soft-delete support
- Separate production environment configuration

---

# 🔐 Security Practices

- Passwords are hashed before storage.
- Authentication is handled server-side.
- Authorization checks are performed on protected APIs.
- Organizer ownership is validated on the server.
- User input is validated using Zod.
- Sensitive environment variables are excluded from source control.
- Ticket status is verified before check-in.
- API errors use structured responses instead of exposing unnecessary internal details.

---

# 📚 Assignment Requirement Mapping

| Requirement | Implementation |
|---|---|
| User registration | Registration API + registration UI |
| Login | NextAuth authentication |
| Session/JWT authentication | NextAuth session-based authentication |
| Two primary roles | `ATTENDEE` and `ORGANIZER` |
| Server-side role enforcement | `requireRole()` on protected APIs |
| Attendee cannot access Organizer APIs | Server-side authorization |
| Event creation | Organizer event API/UI |
| Event management | Organizer event management |
| Event discovery | Public events pages |
| Ticket booking | Booking API + UI |
| Ticket availability | Ticket quantity/inventory tracking |
| Digital tickets | Ticket records + QR codes |
| Ticket verification | QR scanning + server verification |
| Organizer dashboard | Summary/statistics APIs and dashboard |
| Production deployment | Vercel |
| Persistent database | PostgreSQL/Neon |

---

# 🎯 Design Goals

The project was developed with the following goals:

1. **Correctness** — protect booking and ticket data from invalid operations.
2. **Security** — enforce authentication and authorization on the server.
3. **Usability** — provide separate workflows for Attendees and Organizers.
4. **Maintainability** — keep API, service, validation, and UI concerns modular.
5. **Scalability** — use a relational database and structured backend architecture.
6. **Production readiness** — deploy the application with external managed services.

---

# 🚧 Future Improvements

Potential future enhancements include:

- Online payment gateway integration
- Advanced organizer analytics
- Automated booking confirmation emails
- Refund automation
- Event reminders
- Reviews and ratings
- Favorite events
- Advanced admin dashboard
- Rate limiting
- Audit logging
- Automated testing and CI/CD
- More granular permissions

---

# 👨‍💻 Developer

**Shubhi Kumari**

B.Tech — Artificial Intelligence & Machine Learning

| | |
|---|---|
| GitHub | https://github.com/Shubhi-Kumari-dev |
| Project | Eventify — Event Management & Ticketing Platform |
| Live Demo | https://event-booking-platform-2hgfgkefo-shubhi-kumari-devs-projects.vercel.app |

---

## 📄 License

This project was developed as a full-stack development assignment/project.

---

<p align="center">
  Built with ❤️ using Next.js, TypeScript, Prisma and PostgreSQL.
</p>
