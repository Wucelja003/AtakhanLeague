# Atakhan League

A League of Legends tournament platform — register teams, sign up as a solo
player, watch the bracket fill in, and compete for the Rift.

## Stack

**Frontend:** React 19, Vite, Tailwind v4, Redux Toolkit + redux-persist, React Router 7
**Backend:** Express 5, Prisma 7, PostgreSQL (Supabase), bcrypt, JWT (HTTP-only cookies)
**Email:** Resend (transactional emails for password reset & contact form)

## Features

- Authentication with Summoner Name + Email + Password
- Password validation checklist that updates as you type
- Forgot/Reset password flow via email
- Profile management — update credentials, cancel registrations, delete account
- Tournament registration — Team (captain) or Individual (solo player)
- Live Players Pool — see other registered solo players and remaining slots per role
- Tournament bracket view (quarterfinals → semifinals → final)
- Match schedule table with times
- Summoner rankings leaderboard
- Custom dark/crimson design system with glassmorphism cards

## Local setup

### 1. Install dependencies

```bash
# Root (shared deps + backend)
npm install

# Frontend
cd AtakhanLeague
npm install
```

### 2. Environment variables

Create `backEnd/.env`:

```env
DATABASE_URL="postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...pooler.supabase.com:5432/postgres"
JWT_SECRET="your_long_random_string"
RESEND_API_KEY="re_..."
FRONTEND_URL="http://localhost:5173"
ADMIN_EMAIL="your@email.com"
```

### 3. Database setup

```bash
cd backEnd
npx prisma migrate dev
npx prisma generate
```

### 4. Run

```bash
# Backend (port 3000)
cd backEnd
npm run dev

# Frontend (port 5173)
cd AtakhanLeague
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project structure

```
AtakhanLeague/
├── AtakhanLeague/      # Frontend (Vite + React)
│   ├── src/
│   │   ├── Pages/      # Top-level route components
│   │   ├── Components/ # Reusable UI
│   │   └── redux/      # User state + persist
│   └── public/         # Static assets (logo, video, icons)
└── backEnd/            # Backend (Express + Prisma)
    ├── controllers/    # Route handlers
    ├── routes/         # Express routers
    ├── utils/          # Helpers (error, mailer, JWT verify)
    └── prisma/         # Schema + migrations
```

## Disclaimer

Atakhan League is an independent community-run tournament platform and is not
endorsed by, sponsored by, or affiliated with Riot Games, Inc. League of Legends
and Riot Games are trademarks of Riot Games, Inc.
