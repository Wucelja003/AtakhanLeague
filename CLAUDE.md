# Atakhan League — Project Context

> **Brief for Claude:** This is a working LoL tournament platform. Below is a
> compact state snapshot so a fresh session can pick up where the last one left
> off without re-deriving anything. **Read this entire file before editing.**

## What this is

**Atakhan League** — a community-run League of Legends tournament platform.
Owner: Vukašin (Serbia, EUNE region). Site is live at
[atakhanleague.com](https://atakhanleague.com). First tournament: 28 June 2026.

## Production URLs

| Service | URL | Hosted on |
|---|---|---|
| Frontend (Vite + React) | https://atakhanleague.com | Vercel |
| Backend (Express + Prisma) | https://api.atakhanleague.com | Railway |
| Database (PostgreSQL) | Supabase (pooled via Railway) | Supabase |
| Repo | https://github.com/Wucelja003/AtakhanLeague | GitHub |

## Stack

**Frontend:** React 19, Vite, Tailwind v4, Redux Toolkit + redux-persist,
React Router 7, react-helmet-async (SEO), vite-plugin-sitemap, Google Analytics 4
**Backend:** Express 5, Prisma 7 (PostgreSQL), bcrypt, JWT in HTTP-only cookies,
Resend (transactional email), Riot Games API (Account-V1, Summoner-V4,
League-V4, Match-V5, Champion-Mastery-V4)

## Custom design tokens (in `AtakhanLeague/src/index.css`)

- Colors: `--color-primary: #7B1A1A`, `--color-secondary: #8B0000`,
  `--color-accent-gold: #d4af37`. Crimson `#DC143C` used throughout.
- Fonts: `--font-heading` (Bebas Neue), `--font-slogan` (Oxanium),
  `--font-body` (Exo 2), `--font-nav` (Inter), `--font-orbitron`.
- Custom animations: `animate-wind-flow-login`, `animate-fade-in-down`,
  `animate-form-fade-in`, `animate-slide-in-left`, `animate-field-slide-in`,
  `animate-shake`, `animate-dropdown-open`, `animate-header-effect`.
- Glass card pattern: `bg-[rgba(10,10,10,0.65)] border border-[rgba(102,0,0,0.35)] backdrop-blur-md shadow-[0_0_48px_rgba(102,0,0,0.22),inset_0_0_24px_rgba(102,0,0,0.06)]`

## Folder layout (monorepo)

```
AtakhanLeague/
├── AtakhanLeague/         # Frontend (Vercel root = this)
│   ├── src/
│   │   ├── Pages/         # Route-level: Home, SignIn, SignUp, Profile,
│   │   │                  # Tournaments, League, Rankings, ContactUs, Terms,
│   │   │                  # ForgotPassword, ResetPassword
│   │   ├── Components/    # Header, Footer, VideoBackground, Introduce,
│   │   │                  # Journey, TournamentInfo, Registration,
│   │   │                  # RegistrationForm, RoleDropdown, TournamentBoard,
│   │   │                  # PlayersPool, DiscordSection, TeamRoster,
│   │   │                  # RiotStats, SEO, PrivateRoute
│   │   ├── redux/         # store.js, user/userSlice.js
│   │   ├── api.js         # `api(path)` helper — uses VITE_API_URL in prod
│   │   └── App.tsx, main.tsx, index.css
│   ├── public/            # AtakhanMainLogo.svg, AtakhanMovie.mp4 (20MB),
│   │                      # mainDemon-removebg-preview.png, Icons/*,
│   │                      # og-image.png, robots.txt (auto-generated)
│   └── vercel.json        # SPA rewrites
└── backEnd/               # Backend (Railway root = `backEnd`)
    ├── controllers/       # auth, user, contact, registration, team, riot
    ├── routes/            # one route file per controller
    ├── utils/             # error.js, verifyUser.js, mailer.js, riot.js
    ├── prisma/
    │   ├── schema.prisma
    │   └── migrations/    # CHECK GIT for latest migration
    ├── db.js              # Prisma client singleton (uses pg adapter)
    ├── index.js           # Express server, mounts all routers
    └── package.json       # postinstall: prisma generate && prisma migrate deploy
```

## Database schema (Prisma)

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String?
  googleId  String?  @unique         // unused legacy
  username  String   @unique         // Riot game name
  role      Role     @default(PLAYER)

  resetToken       String?   @unique
  resetTokenExpiry DateTime?

  riotPuuid    String?  @unique      // set at signup via Riot verify
  riotGameName String?
  riotTagLine  String?

  team                   Team?
  individualRegistration IndividualRegistration?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role { PLAYER ADMIN }

model Team {
  id              String       @id @default(uuid())
  name            String       @unique
  division        String
  captainId       String       @unique
  captainUsername String
  captainRole     LaneRole?
  captain         User         @relation(...)
  members         TeamMember[]
  createdAt       DateTime     @default(now())
}

model TeamMember {            // 4 other players added by captain on Profile
  id        String   @id @default(uuid())
  teamId    String
  teamName  String              // denormalized for easy admin view
  team      Team     @relation(...)
  username  String
  role      LaneRole
  division  String?
  createdAt DateTime @default(now())
  @@unique([teamId, role])     // can't have two same lanes in one team
}

model IndividualRegistration { // solo players seeking a team
  id        String   @id @default(uuid())
  userId    String   @unique
  username  String
  user      User     @relation(...)
  division  String
  role      LaneRole
  createdAt DateTime @default(now())
}

enum LaneRole { TOP JUNGLE MID ADC SUPPORT }
```

## API endpoints (backend)

```
auth:           POST /api/auth/signup           (verifies Riot ID before creating)
                POST /api/auth/signin
                POST /api/auth/signout
                POST /api/auth/forgot-password
                POST /api/auth/reset-password/:token
user:           POST /api/user/update/:id
                DELETE /api/user/delete/:id
contact:        POST /api/contact
registration:   POST /api/registration/team       (captain)
                POST /api/registration/individual
                DELETE /api/registration/team
                DELETE /api/registration/individual
                GET /api/registration/me
                GET /api/registration/teams       (public)
                GET /api/registration/individuals (public)
team (roster):  GET /api/team/roster              (captain only)
                POST /api/team/member
                DELETE /api/team/member/:id
riot:           GET /api/riot/me                  (op.gg-style stats, 5min cache)
misc:           GET /api/health
                GET /
```

All auth uses HTTP-only cookie `access_token` with JWT (7-day expiry).
Cookie config is `{ httpOnly: true, secure: true, sameSite: 'none' }` —
hardcoded, no NODE_ENV dependency, so cross-origin works between Vercel
and Railway. **Don't change this** unless you're aware it'll break auth.

## Env vars required

**Backend (Railway):**
- `DATABASE_URL` (Supabase pooler, port 6543)
- `DIRECT_URL` (Supabase direct, port 5432, for migrations)
- `JWT_SECRET`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `FRONTEND_URL` (= `https://atakhanleague.com`)
- `RIOT_API_KEY` (RGAPI-... — Personal/Production key APPROVED (App ID 846268),
  does NOT expire every 24h. Rate limits: 20 req/s, 100 req/2min)

**Frontend (Vercel):**
- `VITE_API_URL` (= `https://api.atakhanleague.com`)

## DNS / Domain

Domain `atakhanleague.com` is on Cloudflare. Records:
- `atakhanleague.com` A → 76.76.21.21 (Vercel) DNS only
- `www` CNAME → cname.vercel-dns.com — DNS only
- `api` CNAME → Railway's generated domain — **DNS only (not Proxied)** ←
  important. Cloudflare proxy breaks Railway SSL.
- MX records → Cloudflare Email Routing
- SPF + DKIM → for Resend email auth
- Resend domain `atakhanleague.com` is verified — `noreply@atakhanleague.com`

## Things that bit us before (avoid)

1. **Cookie sameSite='lax'** broke cross-site auth — must be `'none'` always.
2. **Cloudflare proxy on `api` CNAME** breaks Railway SSL — must be DNS only.
3. **Prisma 7 changed schema rules** — `url` and `directUrl` go in
   `prisma.config.ts`, not `datasource db {}` in schema.prisma.
4. **`prisma-client-js` generator is deprecated in Prisma 7** — use
   `prisma-client` (TS output). Backend uses `tsx` to run mixed JS+TS.
5. **`tsc -b && vite build` breaks Vercel build** because of JSX files.
   Use just `vite build`. Already removed from `package.json`.
6. **Atakhan_Promo.mp4 is 219MB** — too big for git. Compressed version
   `AtakhanMovie.mp4` (20MB) is checked in. `Atakhan_Promo.mp4` in `.gitignore`.
7. **redux-persist's `lib/storage` import doesn't resolve in Vite ESM** —
   `redux/store.js` uses a custom localStorage adapter.
8. **Supabase direct connection is IPv6-only** on free tier. Use the
   `pooler.supabase.com` hostnames (transaction pooler 6543, session pooler 5432).
9. **Vercel.json must be at the AtakhanLeague/ folder (frontend root), NOT
   at the repo root** — SPA rewrites won't apply otherwise.
10. **Railway needs `postinstall: prisma generate && prisma migrate deploy`**
    in `backEnd/package.json` so migrations auto-apply on deploy.

## Sandbox quirks in Claude sessions

Some files in `AtakhanLeague/src/Components/` and `AtakhanLeague/src/Pages/`
were sporadically write-locked due to macOS extended attributes during the
session. Working around with `cat > file << EOF` via Bash succeeded for most.
If a Write/Edit tool errors with `EPERM`, fall back to Bash heredoc.

## What's done

✅ Full auth flow (signup with Riot ID verification, signin, signout,
   forgot/reset password via Resend)
✅ Profile page with avatar (dicebear placeholder), update, delete account
✅ Tournament registration (Team + Individual) with conflict prevention
✅ Live PlayersPool — solo players distributed across 5 mock teams
✅ Live TournamentBoard — 4 team slots, fills as captains register
✅ TeamRoster on Profile (only for captains): add/remove 4 lane members
✅ RiotStats on Profile (op.gg-style): profile, ranked S/F, top 3 mastery,
   last 10 matches with KDA + position + duration + Data Dragon icons
✅ All static pages: Home with hero countdown, Tournaments bracket (4 teams),
   League placeholder, Rankings (empty state), ContactUs (form → email),
   Terms (10 sections), ForgotPassword, ResetPassword
✅ Mobile responsive (hamburger menu, stacked grids, scaled fonts)
✅ Welcome email on signup, registration confirmation email, contact form email,
   password reset email — all sent from `noreply@atakhanleague.com`
✅ SEO: per-page Helmet, sitemap.xml, robots.txt, OG image, JSON-LD,
   Google Search Console verified (DNS), Bing imported
✅ GA4 with SPA route tracking (G-3CHGRNN35H)
✅ Deployed live, custom domain, HTTPS

## What's NOT done (next-up candidates)

- Match detail modal (click on match → items, runes, summoner spells,
  team comp) — biggest UX win for next iteration
- Per-champion stats (win rate, KDA per champion)
- Live game detection via Spectator-V5
- Connecting Rankings page to real points data (need to design point system)
- Connecting Tournaments bracket page to real registered teams (currently
  shows mock Team Alpha/Beta/Gamma/Delta)
- Admin panel (for organizer to set match scores → bracket auto-progresses)
- Email verification for new signups (currently anyone can use any email)
- Rate limiting on auth routes
- Multi-tournament support (currently hardcoded for 28.06.2026)
- ~~Riot Personal API Key~~ ✅ APPROVED & deployed (App ID 846268, key on
  Railway + local .env). Verification works at full strength; key is persistent.

## Development workflow

```bash
# Frontend (dev)
cd AtakhanLeague/AtakhanLeague && npm run dev    # → localhost:5173

# Backend (dev) — Vite proxies /api → localhost:3000
cd AtakhanLeague/backEnd && npm run dev          # → localhost:3000

# Prisma Studio
cd AtakhanLeague/backEnd && npm run db:studio    # → localhost:5555

# New migration after schema change
cd AtakhanLeague/backEnd && npx prisma migrate dev --name what_changed

# Deploy = just push
git add . && git commit -m "..." && git push
# Vercel + Railway both auto-deploy from main.
```

## Tone for the owner

Vukašin is a junior dev learning by building. Keep explanations concrete
with file paths and exact commands. He prefers Serbian/Bosnian, code snippets
in English. Show only the diff or the change — don't dump entire files unless
asked. Push commits frequently with descriptive messages in English.
He runs migrations and edits `.env` himself; you write code and push.
