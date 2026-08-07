import { PrismaClient, EventStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const db = new PrismaClient();

const CATEGORIES = [
  "Technology",
  "Music",
  "Business",
  "Sports",
  "Arts",
  "Food & Drink",
  "Health & Wellness",
  "Education",
  "Networking",
  "Comedy",
];

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Nagpur",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(title: string): string {
  return `${slugify(title)}-${randomBytes(3).toString("hex")}`;
}

function generateTicketToken(): string {
  return `EVT-TKT-${randomBytes(16).toString("hex")}`;
}

function bookingReference(): string {
  return `BK-${randomBytes(4).toString("hex").toUpperCase()}`;
}

async function main() {
  console.log("Seeding database...");

  await db.ticket.deleteMany();
  await db.booking.deleteMany();
  await db.ticketType.deleteMany();
  await db.event.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 12);

  const organizer = await db.user.create({
    data: {
      name: "Aditi Sharma",
      email: "organizer@demo.com",
      password: passwordHash,
      role: "ORGANIZER",
      phone: faker.phone.number(),
    },
  });

  const attendee = await db.user.create({
    data: {
      name: "Rahul Verma",
      email: "attendee@demo.com",
      password: passwordHash,
      role: "ATTENDEE",
      phone: faker.phone.number(),
    },
  });

  const extraOrganizers = await Promise.all(
    Array.from({ length: 4 }).map(async (_, i) =>
      db.user.create({
        data: {
          name: faker.person.fullName(),
          email: `organizer${i + 2}@demo.com`,
          password: passwordHash,
          role: "ORGANIZER",
          phone: faker.phone.number(),
        },
      })
    )
  );

  const extraAttendees = await Promise.all(
    Array.from({ length: 10 }).map(async (_, i) =>
      db.user.create({
        data: {
          name: faker.person.fullName(),
          email: `attendee${i + 2}@demo.com`,
          password: passwordHash,
          role: "ATTENDEE",
          phone: faker.phone.number(),
        },
      })
    )
  );

  const allOrganizers = [organizer, ...extraOrganizers];
  const allAttendees = [attendee, ...extraAttendees];

  console.log("Creating 200 events...");

  const eventIds: { id: string; ticketTypeIds: string[] }[] = [];

  for (let i = 0; i < 200; i++) {
    const category = faker.helpers.arrayElement(CATEGORIES);
    const city = faker.helpers.arrayElement(CITIES);
    const organizerForEvent = faker.helpers.arrayElement(allOrganizers);

    const startDate = faker.date.soon({ days: 180 });
    const endDate = new Date(startDate.getTime() + faker.number.int({ min: 2, max: 8 }) * 60 * 60 * 1000);

    const title = `${faker.company.catchPhraseAdjective()} ${category} ${faker.helpers.arrayElement([
      "Summit",
      "Conference",
      "Festival",
      "Meetup",
      "Expo",
      "Workshop",
      "Night",
      "Fair",
    ])}`;

    const status: EventStatus = faker.helpers.weightedArrayElement([
      { value: "PUBLISHED", weight: 8 },
      { value: "DRAFT", weight: 1 },
      { value: "COMPLETED", weight: 1 },
    ]);

    const event = await db.event.create({
      data: {
        title,
        slug: uniqueSlug(title),
        description: faker.lorem.paragraphs(3, "\n\n"),
        category,
        coverImage: `https://picsum.photos/seed/${i}/1200/630`,
        venue: faker.company.name() + " " + faker.helpers.arrayElement(["Hall", "Arena", "Center", "Grounds"]),
        address: faker.location.streetAddress(),
        city,
        startDate,
        endDate,
        status,
        organizerId: organizerForEvent.id,
        ticketTypes: {
          create: [
            {
              name: "General",
              description: "Standard entry ticket",
              price: faker.number.int({ min: 199, max: 999 }),
              quantity: faker.number.int({ min: 50, max: 300 }),
            },
            {
              name: "VIP",
              description: "Priority access and premium seating",
              price: faker.number.int({ min: 1499, max: 4999 }),
              quantity: faker.number.int({ min: 10, max: 60 }),
            },
          ],
        },
      },
      include: { ticketTypes: true },
    });

    eventIds.push({ id: event.id, ticketTypeIds: event.ticketTypes.map((t) => t.id) });

    if (i % 20 === 0) console.log(`  created ${i + 1}/200 events`);
  }

  console.log("Creating demo bookings...");

  const publishedEvents = await db.event.findMany({
    where: { status: "PUBLISHED" },
    include: { ticketTypes: true },
    take: 30,
  });

  for (const event of publishedEvents.slice(0, 20)) {
    const ticketType = faker.helpers.arrayElement(event.ticketTypes);
    const buyer = faker.helpers.arrayElement(allAttendees);
    const quantity = faker.number.int({ min: 1, max: 3 });

    const booking = await db.booking.create({
      data: {
        bookingReference: bookingReference(),
        userId: buyer.id,
        eventId: event.id,
        ticketTypeId: ticketType.id,
        quantity,
        totalAmount: Number(ticketType.price) * quantity,
        status: "CONFIRMED",
      },
    });

    await db.ticket.createMany({
      data: Array.from({ length: quantity }).map(() => ({
        bookingId: booking.id,
        qrCode: generateTicketToken(),
      })),
    });

    await db.ticketType.update({
      where: { id: ticketType.id },
      data: { quantitySold: { increment: quantity } },
    });
  }

  console.log("Seed complete.");
  console.log("Demo organizer login: organizer@demo.com / Password123!");
  console.log("Demo attendee login: attendee@demo.com / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });