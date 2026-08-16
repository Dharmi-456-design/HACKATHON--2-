# NaturePulse — Frontend

The NaturePulse web app: an AI-powered nature relationship platform. Observe, understand, experience, and act for the living world around you.

## Tech Stack

- **React 19 + Vite 7**
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **React Router 7**
- **Express + MongoDB backend** — auth (JWT, email/password), missions, journal, actions, discoveries, community, profile
- **Gemini API (server-side)** — AI image analysis (Nature Lens), mission generation, Pulse chat, stories
- **Framer Motion** — animations
- **lucide-react** — icons

## Pages

- `/` Landing
- `/login`, `/register`, `/reset-password` — Express JWT auth (email + password)
- `/onboarding` — pick city, region, and interests
- `/app` — Dashboard (connection score, missions, places, discoveries)
- `/app/lens` — Nature Lens (AI photo analysis)
- `/app/places` — Nearby curated places
- `/app/act` — Actions
- `/app/journal` — Field journal
- `/app/stories` — Community stories
- `/app/community` — Community discussion + biodiversity map
- `/app/passport` — Biodiversity passport
- `/app/pulse` — Pulse Chat (AI companion)
- `/app/settings` — Profile settings

## Setup

```bash
npm install
cp .env.example .env
```

Fill `.env` with your backend URL:

```env
VITE_API_URL=http://localhost:5000
VITE_DEMO_MODE=false
```

`VITE_DEMO_MODE=true` runs the app with fabricated sample data and no backend calls. It can also be toggled at runtime with `Ctrl+Shift+D`. Never enable it in production.

### Local development

```bash
npm run dev
```

Runs at `http://localhost:5173`.

### Production build

```bash
npm run build
npm run preview
```

The frontend is a static SPA deployed anywhere (e.g. Vercel, with the catch-all rewrite in `vercel.json`). All data and auth live in the separate Express + MongoDB backend; all AI calls (Gemini) happen server-side, so no API keys are bundled in the browser.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
