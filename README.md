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

# ✅ Correctness Requirements

The implementation focuses on the correctness requirements of the platform rather than relying only on frontend validation.

## 1. Role-Based Server Authorization

Organizer endpoints validate the authenticated user's role on the server.

An Attendee cannot access organizer functionality by directly sending an HTTP request to an organizer endpoint.

This satisfies the requirement:

> An Attendee must not be able to hit Organizer endpoints.

---

## 2. Ticket Availability

Ticket inventory is maintained using:

```text
quantity
quantitySold
```

The available quantity is derived from the ticket inventory.

Booking requests validate the requested quantity against available inventory before completing the booking.

---

## 3. Booking Consistency

Booking operations involve multiple related database records, including bookings and tickets.

Prisma transactions are used where multiple related updates must succeed together, helping prevent partially completed booking operations.

The goal is to maintain consistency between:

```text
Booking
   ↕
Ticket
   ↕
Ticket Inventory
```

---

## 4. Input Validation

Inputs are validated before being processed.

Validation is used for areas such as:

- User registration
- Event creation
- Event updates
- Booking requests
- Event filters
- Query parameters

Zod schemas provide structured validation and prevent malformed data from reaching business logic.

---

## 5. Ticket Verification

Every issued ticket has its own ticket record and QR data.

During verification, the server checks the ticket status before allowing a check-in.

A ticket marked:

```text
USED
```

cannot be treated as a new valid ticket again.

This prevents duplicate ticket usage.

---

## 6. Organizer Ownership

Organizer operations are associated with the authenticated organizer's user ID.

The server does not rely only on an event ID supplied by the client.

This prevents one organizer from managing another organizer's events.

---

## 7. API Error Handling

API responses follow a consistent structure.

### Success

```json
{
  "success": true,
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Readable error message"
  }
}
```

Centralized error handling makes API behavior predictable for the frontend.

---

## 8. Soft Delete

Events support soft deletion using a `deletedAt` field where applicable.

Instead of immediately removing records from the database, the record can be marked as deleted and excluded from normal application queries.

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
