import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is required for seeding');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(connectionString),
});

const CREATOR_EMAIL = 'emmanueldennise99@gmail.com';
const CREATOR_PASSWORD = process.env.SEED_CREATOR_PASSWORD || '042x123y';

const eventTemplates = [
  { title: 'Lagos Afrobeat Night', description: 'Live performances from top Afrobeat artists under the stars.', location: 'Eko Convention Centre, Lagos', price: 15000, capacity: 500 },
  { title: 'Abuja Jazz & Soul Festival', description: 'An evening of smooth jazz, soul, and R&B with international acts.', location: 'Transcorp Hilton, Abuja', price: 12000, capacity: 300 },
  { title: 'Tech Founders Summit 2026', description: 'Connect with innovators, investors, and startup founders across Africa.', location: 'Landmark Event Centre, Lagos', price: 25000, capacity: 400 },
  { title: 'Nollywood Premiere: The Return', description: 'Exclusive red carpet premiere with cast Q&A and after-party.', location: 'Silverbird Galleria, Lagos', price: 8000, capacity: 200 },
  { title: 'Port Harcourt Food & Wine Expo', description: 'Taste cuisines from 50+ vendors paired with fine wines.', location: 'Port Harcourt Polo Club', price: 5000, capacity: 600 },
  { title: 'Calabar Carnival Warm-Up', description: 'Street parade preview with costumes, dance troupes, and live bands.', location: 'Calabar Cultural Centre', price: 3000, capacity: 1000 },
  { title: 'Startup Pitch Battle', description: 'Watch 20 startups pitch for ₦5M in seed funding.', location: 'CcHub, Yaba Lagos', price: 0, capacity: 150 },
  { title: 'Wellness & Yoga Retreat', description: 'Full-day mindfulness, yoga sessions, and healthy brunch.', location: 'Obudu Mountain Resort', price: 18000, capacity: 80 },
  { title: 'Comedy Night Live', description: 'Stand-up comedy featuring Nigeria\'s funniest comedians.', location: 'Muson Centre, Lagos', price: 7000, capacity: 350 },
  { title: 'Art Gallery Opening: New Voices', description: 'Contemporary African art exhibition with curator-led tours.', location: 'National Museum, Lagos', price: 4000, capacity: 120 },
  { title: 'Football Watch Party: Super Eagles', description: 'Big screen viewing with food, drinks, and fan zone activities.', location: 'Tafawa Balewa Square, Lagos', price: 2000, capacity: 800 },
  { title: 'Book Club Literary Festival', description: 'Author readings, panel discussions, and book signings.', location: 'University of Ibadan', price: 3500, capacity: 250 },
  { title: 'Halloween Party', description: 'Costume contest, haunted house, and DJ sets until dawn.', location: 'Sanhosen, Lagos', price: 20000, capacity: 300 },
  { title: 'Gospel Praise Concert', description: 'An uplifting night of worship with renowned gospel artists.', location: 'House on the Rock, Lagos', price: 6000, capacity: 5000 },
  { title: 'Photography Masterclass', description: 'Learn portrait and event photography from industry pros.', location: 'Studio 24, Victoria Island', price: 15000, capacity: 40 },
  { title: 'Kids Science Fair', description: 'Interactive experiments and STEM workshops for ages 6-14.', location: 'Lekki Conservation Centre', price: 2500, capacity: 200 },
  { title: 'Fashion Week Preview', description: 'Runway show featuring emerging Nigerian designers.', location: 'Federal Palace Hotel, Lagos', price: 35000, capacity: 180 },
  { title: 'Blockchain & Web3 Meetup', description: 'Talks on DeFi, NFTs, and building on-chain in Africa.', location: 'Radisson Blu, Ikeja', price: 5000, capacity: 120 },
  { title: 'Poetry Slam Championship', description: 'Spoken word poets compete for the national title.', location: 'Terra Kulture, Lagos', price: 4500, capacity: 100 },
  { title: 'Beach Volleyball Tournament', description: 'Amateur and pro teams battle it out on Tarkwa Bay sands.', location: 'Tarkwa Bay Beach, Lagos', price: 1500, capacity: 400 },
  { title: 'Classical Music Evening', description: 'Symphony orchestra performs Beethoven and contemporary works.', location: 'Muson Centre, Lagos', price: 10000, capacity: 280 },
  { title: 'Startup Networking Brunch', description: 'Casual brunch for founders, VCs, and tech professionals.', location: 'Nok by Alara, Lagos', price: 8000, capacity: 60 },
  { title: 'Drone Racing Championship', description: 'High-speed FPV drone races with live commentary.', location: 'National Stadium, Abuja', price: 3500, capacity: 500 },
  { title: 'Vintage Car Show', description: 'Classic and vintage automobiles on display with live auctions.', location: 'Eko Atlantic City', price: 5000, capacity: 700 },
  { title: 'Coding Bootcamp Demo Day', description: 'Graduates showcase full-stack projects to hiring partners.', location: 'AltSchool Africa HQ', price: 0, capacity: 100 },
  { title: 'Wine Tasting Masterclass', description: 'Sommelier-led tasting of 12 premium wines from around the world.', location: 'Radisson Blu, Lagos', price: 22000, capacity: 50 },
  { title: 'Afro Dance Workshop', description: 'Learn Azonto, Amapiano, and traditional dance styles.', location: 'Freedom Park, Lagos', price: 3000, capacity: 80 },
  { title: 'Environmental Summit', description: 'Climate action talks, green tech demos, and tree planting.', location: 'UN House, Abuja', price: 0, capacity: 350 },
  { title: 'Magic & Illusion Show', description: 'Mind-bending magic from award-winning illusionists.', location: 'Eko Hotel, Lagos', price: 9000, capacity: 400 },
  { title: 'New Year Countdown Gala', description: 'Ring in 2027 with fireworks, live music, and champagne toast.', location: 'Landmark Beach, Lagos', price: 50000, capacity: 2000 },
];

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function addHours(base: Date, hours: number): Date {
  const d = new Date(base);
  d.setHours(d.getHours() + hours);
  return d;
}

async function main() {
  const hashedPassword = await bcrypt.hash(CREATOR_PASSWORD, 10);

  const creator = await prisma.user.upsert({
    where: { email: CREATOR_EMAIL },
    update: {
      name: 'Emmanuel Dennis',
      password: hashedPassword,
      role: Role.CREATOR,
      authProvider: 'local',
    },
    create: {
      email: CREATOR_EMAIL,
      name: 'Emmanuel Dennis',
      password: hashedPassword,
      role: Role.CREATOR,
      authProvider: 'local',
    },
  });

  const eventeePassword = await bcrypt.hash('password123', 10);
  const eventees = await Promise.all(
    ['demo.eventee1@test.com', 'demo.eventee2@test.com'].map((email, i) =>
      prisma.user.upsert({
        where: { email },
        update: { name: `Demo Eventee ${i + 1}`, password: eventeePassword, role: Role.EVENTEE },
        create: { email, name: `Demo Eventee ${i + 1}`, password: eventeePassword, role: Role.EVENTEE },
      }),
    ),
  );

  const now = new Date();
  let created = 0;

  for (let i = 0; i < eventTemplates.length; i++) {
    const template = eventTemplates[i];
    const isClosed = i < 8;
    const daysOffset = isClosed ? -(i + 3) : i + 7;
    const eventDate = addHours(addDays(now, daysOffset), 10 + (i % 12));
    const ticketsSold = isClosed
      ? template.capacity
      : Math.min(Math.floor(template.capacity * (0.1 + (i % 5) * 0.08)), template.capacity - 1);

    const event = await prisma.event.create({
      data: {
        title: template.title,
        description: template.description,
        location: template.location,
        price: template.price,
        capacity: template.capacity,
        ticketsSold,
        date: eventDate,
        reminderInterval: i % 2 === 0 ? '1_DAY' : '1_WEEK',
        creatorId: creator.id,
      },
    });

    if (i === 12 && eventees[0]) {
      await prisma.ticket.create({
        data: {
          eventId: event.id,
          userId: eventees[0].id,
          paymentReference: `SEED-EVT-${event.id.slice(0, 8)}`,
          status: 'PAID',
          verificationToken: `seed-token-${event.id.slice(0, 8)}`,
          qrCodeUrl: null,
        },
      });
    }

    created++;
  }

  console.log(`Seeded creator: ${creator.email}`);
  console.log(`Seeded ${created} events (${8} closed/sold out, ${created - 8} available)`);
  console.log(`Seeded ${eventees.length} demo eventees`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
