# Eventful

Full-stack event ticketing platform with QR codes, payments, and analytics.

## About

**Eventful** helps creators publish events, sell tickets, scan attendees at the gate, and track revenue — while eventees discover events, pay securely, and manage tickets with QR codes and email reminders.

| | |
|---|---|
| **Live app** | [https://events-management-2fpp.onrender.com/events](https://events-management-2fpp.onrender.com/events) |
| **API docs (Swagger)** | [https://eventful-backend-dn2u.onrender.com/docs](https://eventful-backend-dn2u.onrender.com/docs) |
| **Website** | [https://youreventful.org](https://youreventful.org) |

**Topics:** `react` · `nodejs` · `typescript` · `postgresql` · `nestjs` · `event-management`

---

## Features

### Creators
- Create and manage events (capacity, pricing, reminders)
- Creator dashboard with analytics and booking lists
- QR camera check-in at the venue gate
- Payment history across events

### Eventees
- Browse and book tickets (Paystack, NGN)
- QR tickets with deep links
- Custom email reminders before events
- Google OAuth and email/password auth
- Profile management (name, password, account deletion)

### Platform
- JWT authentication with role-based access (`CREATOR` / `EVENTEE`)
- Transactional email via Resend (`no-reply@`, `support@`, custom domain)
- Redis caching and rate limiting
- Scheduled reminder delivery (cron)
- Light/dark theme on the frontend

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | NestJS 11, TypeScript, Prisma, PostgreSQL |
| **Payments** | Paystack |
| **Email** | Resend + Cloudflare Email Routing |
| **Cache / limits** | Redis, Upstash |
| **Auth** | JWT, Google OAuth, bcrypt |
| **Deploy** | Render |

---

## Project structure

```
HNG-Capstone/
├── frontend/          # React SPA (Vite)
├── src/               # NestJS API
├── prisma/            # Schema, migrations, seed
├── render.yaml        # Render deployment blueprint
└── .env.example       # Backend env template
```

---

## Quick start (local)

### Prerequisites

- Node.js 20+
- PostgreSQL
- Redis (optional locally; defaults to `redis://localhost:6379`)

### 1. Backend

```bash
npm install --legacy-peer-deps
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, PAYSTACK_SECRET_KEY, etc.

npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000

npm run dev
```

- App: `http://localhost:5173`

---

## Environment variables

See [`.env.example`](.env.example) (backend) and [`frontend/.env.example`](frontend/.env.example).

Key production values on Render:

| Variable | Service | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | API | PostgreSQL connection |
| `REDIS_URL` | API | Cache + throttling |
| `JWT_SECRET` | API | Auth tokens |
| `CLIENT_URL` | API | CORS + Paystack callback |
| `PAYSTACK_SECRET_KEY` | API | Payments |
| `RESEND_API_KEY` | API | Outbound email |
| `MAIL_DOMAIN` | API | e.g. `youreventful.org` |
| `VITE_API_URL` | Web | Backend URL |
| `VITE_GOOGLE_CLIENT_ID` | Web | Google sign-in |

---

## API documentation

Interactive Swagger UI:

- **Production:** [https://eventful-backend-dn2u.onrender.com/docs](https://eventful-backend-dn2u.onrender.com/docs)
- **Local:** `http://localhost:3000/docs`

Authenticate via **Authorize** using a Bearer token from `POST /auth/login` or `POST /auth/google`.

Main route groups: `auth`, `events`, `payments`, `tickets`, `analytics`, `notifications`.

---

## Deployment

Deploy both services on [Render](https://render.com) using [`render.yaml`](render.yaml):

1. **eventful-api** — NestJS web service  
2. **eventful-web** — static site (`frontend/dist`)

Set all env vars in the Render dashboard before the first deploy. Run migrations via the API start command (`prisma migrate deploy`).

---

## Scripts

```bash
# Backend
npm run start:dev      # Dev server with watch
npm run build          # Compile to dist/
npm run test           # Unit tests
npm run start:prod     # Production (node dist/main.js)

# Database
npx prisma migrate dev
npx prisma db seed

# Frontend
cd frontend && npm run dev
cd frontend && npm run build
```

---

## License

MIT
