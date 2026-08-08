

Readme · MD
Eventify — Event Management & Ticketing Platform
Production-style full-stack platform for creating events, selling tickets, and validating entry via QR codes.

🔗 Live Demo
https://event-booking-platform-neon.vercel.app

🚀 Tech Stack
Next.js 16 (App Router)
TypeScript
Tailwind CSS
shadcn/ui
Prisma ORM
PostgreSQL (Neon)
Auth.js
Cloudinary
Resend
Zod
React Hook Form
Framer Motion
html5-qrcode
Architecture Decisions
Atomic Seat Locking
Bookings use a conditional updateMany inside a Prisma transaction instead of the traditional check-then-write approach. This prevents overselling when multiple users book the last remaining seats simultaneously.

Soft Delete Strategy
Events that already have bookings are soft deleted.

Instead of removing the record:

deletedAt is populated.
Status becomes CANCELLED.
Events without bookings are permanently deleted.

This preserves ticket history and booking records.

Event Scoped QR Verification
QR verification is tied to a specific event.

Possible responses:

VALID
ALREADY_USED
CANCELLED
WRONG_EVENT
NOT_FOUND
This prevents tickets from one event being used at another.

Authentication
Auth.js Credentials Provider

bcrypt password hashing
JWT Sessions
Role Based Access Control
Roles:

ADMIN
ORGANIZER
ATTENDEE
Authorization is enforced through:

middleware.ts
requireRole()
Error Handling
Centralized API error handling.

Every API returns a consistent JSON structure using custom AppError classes.

Price Sorting
Since ticket price belongs to a related table (TicketType), Prisma cannot directly sort events by the minimum ticket price.

For the MVP:

Events are fetched normally.
The current page (12–50 records) is sorted in memory.
At larger scale this would be replaced with:

denormalized minPrice
raw SQL
materialized views
Project Setup
bash
git clone <repository-url>

cd event-ticketing-platform

npm install

cp .env.example .env

# Fill:

DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=

npx prisma generate

npx prisma migrate dev

npx prisma db seed

npm run dev
Neon Database
Use:

DATABASE_URL → Pooled Connection
DIRECT_URL → Direct Connection
This avoids Prisma connection reset issues during development.

Demo Accounts
Role	Email	Password
Organizer	organizer@demo.com	Password123!
Attendee	attendee@demo.com	Password123!
Database Relationships
User
 ├── Events (Organizer)
 └── Bookings

Event
 ├── TicketTypes
 └── Bookings

Booking
 ├── Tickets
 └── Payment
API Overview
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
/api/bookings/[id]	GET, PATCH	Booking Owner
/api/tickets/verify	POST	Organizer
/api/organizer/events	GET	Organizer
/api/organizer/events/[id]/stats	GET	Organizer
/api/organizer/summary	GET	Organizer
/api/upload	POST	Organizer
Features
User Authentication
Role Based Authorization
Event CRUD
Multiple Ticket Types
Secure Booking
Atomic Seat Locking
QR Ticket Generation
QR Ticket Validation
Organizer Dashboard
Analytics
Search
Pagination
Sorting
Date Filters
Price Filters
Soft Delete
Cloudinary Upload
Email Notifications
Development Commands
Generate Prisma Client

bash
npx prisma generate
Create Migration

bash
npx prisma migrate dev --name migration_name
Seed Database

bash
npx prisma db seed
Start Development

bash
npm run dev
Testing
Event List
bash
GET /api/events
Price Sort
bash
GET /api/events?sortBy=priceAsc
bash
GET /api/events?sortBy=priceDesc
Newest Events
bash
GET /api/events?sortBy=newest
Date Filter
bash
GET /api/events?startDateFrom=2026-08-01&startDateTo=2026-12-31
Price Filter
bash
GET /api/events?minPrice=500&maxPrice=2000
Verify QR Ticket
bash
POST /api/tickets/verify
Organizer Dashboard
bash
GET /api/organizer/summary

GET /api/organizer/events

GET /api/organizer/events/{id}/stats
Future Improvements
Rate Limiting
Booking Idempotency
Redis Cache
Advanced Analytics
Payment Gateway Integration
Event Wishlist
Refund Workflow
Calendar Integration
License
Developed as a Full Stack Event Management & Ticketing Platform using Next.js, Prisma, PostgreSQL and Auth.js.


