# NaturePulse — AI-powered Nature Relationship Platform

**Built for ORGENHACKS 2026.**

NaturePulse turns everyday surroundings into a quiet layer of discovery. It helps people observe, understand, experience, and act for the living world already around them — without inventing species names or exposing exact locations.

This repository contains two apps:

| Directory | What it is |
|---|---|
| [`frontend/`](./frontend) | NaturePulse web app — React + Vite + Tailwind CSS 4, Supabase, Gemini AI |
| [`backend/`](./backend) | Green Watch API — Node.js + Express + MongoDB issue reporting & resolution API |

---

## Frontend — NaturePulse

A nature-relationship platform built around the journey **Observe → Understand → Experience → Act → Measure → Return**.

### Features

- **Nature Lens** — snap a photo and get an honest, hedged AI read on what you found (Gemini), with a "we don't invent species names" stance
- **Nearby** — browse curated local places by habitat, type, and city
- **Act** — one modest, legal, local action keeps the relationship honest
- **Journal** — keep a quiet record of visits, notes, and return dates
- **Stories** — read and share community nature stories
- **Community** — discuss and share with other members
- **Pulse Chat** — talk to an AI companion grounded in your own discoveries and missions
- **Nature Connection Score** — measured across Observe, Explore, Learn, Act, and Return dimensions
- **Onboarding** — personalize with city, region, and interests
- **Theming** — light/dark mode, mobile-first layout

### Tech Stack

- **React 19 + Vite 7** — UI and build tooling
- **Tailwind CSS 4** — utility-first styling (`@tailwindcss/vite`)
- **React Router 7** — client-side routing
- **Supabase** — auth (email + Google), Postgres, and storage
- **Gemini API** — image analysis, mission generation, and chat
- **Framer Motion** — animations
- **Vercel** — deployment (serverless API routes in `api/`)

### Supabase schema (`np_` tables)

`np_profiles`, `np_discoveries`, `np_missions`, `np_places`, `np_journal`, `np_stories`, `np_community`, `np_scores`, `np_actions`, `np_pulse`

### Setup

```bash
cd frontend
npm install
```

Create `.env` from the example and fill in your keys:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_AUTH_PROXY=https://your-auth-proxy-url
```

The `api/` directory (serverless routes used by the deployed app) reads `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the environment.

Run the dev server:

```bash
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Backend — Green Watch API

Community environmental issue reporting and resolution tracking. Express + MongoDB (Mongoose) REST API.

### Features

- JWT + bcrypt authentication with role-based access (citizen / admin)
- Issue reporting with categories, geo-location, images, upvotes, and status workflow (`reported → acknowledged → in_progress → resolved`)
- Comments on issues
- Admin analytics (`/api/admin/stats`) and leaderboard
- Image uploads to Cloudinary (images only, max 5 MB)
- Rate limiting on auth routes, helmet, CORS
- Seed script for demo data

### Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill `.env` with your MongoDB URI, JWT secret, and Cloudinary keys, then run:

```bash
npm run dev        # development (nodemon)
npm start          # production
```

Backend runs on `PORT` (default 5000).

Seed demo data (admin, citizens, sample issues and comments — idempotent):

```bash
npm run seed
```

Seed admin: `admin@greenwatch.app` / `Admin@12345`

### Main endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, returns `{user, token}` |
| GET | `/api/auth/me` | Yes | Current user |
| GET/POST | `/api/issues` | Read: no / Write: yes | List or create issues |
| GET | `/api/issues/:id` | No | Issue detail |
| PATCH/DELETE | `/api/issues/:id` | Owner/admin | Edit / soft-delete |
| POST | `/api/issues/:id/upvote` | Yes | Toggle upvote |
| PATCH | `/api/issues/:id/status` | Admin | Change status |
| GET/POST | `/api/issues/:id/comments` | Read: no / Write: yes | Comments |
| GET | `/api/admin/stats` | Admin | Live aggregation |
| GET | `/api/admin/leaderboard` | No | Top reporters |
| POST | `/api/upload` | Yes | Upload image → `{url}` |

Full API reference (request/response examples, filters, env vars) lives in [`backend/README.md`](./backend/README.md). A Postman collection is at `backend/postman_collection.json`.

---

## Project structure

```
├── backend/            # Green Watch REST API (Express + MongoDB)
│   └── src/
│       ├── config/     # DB + Cloudinary config
│       ├── controllers/# Request handlers
│       ├── middleware/ # Auth, roles, uploads, errors
│       ├── models/     # Mongoose schemas
│       ├── routes/     # API routes
│       ├── services/   # Business logic (points, issues)
│       ├── utils/      # Token + async helpers
│       └── validators/ # express-validator schemas
├── frontend/           # NaturePulse web app (React + Vite)
│   ├── api/            # Vercel serverless routes (Supabase)
│   ├── public/         # Static assets & images
│   └── src/
│       ├── components/ # Reusable UI (AppShell, ui, theme)
│       ├── contexts/   # Auth, theme
│       ├── lib/        # API client, Supabase, Google auth
│       └── pages/      # Route components
└── README.md
```

## Notes

- Never commit real secrets — `.env` files are gitignored in both apps.
- This project was built for the ORGENHACKS 2026 Hackathon.
