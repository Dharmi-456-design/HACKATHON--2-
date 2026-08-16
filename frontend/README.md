# NaturePulse — Frontend

The NaturePulse web app: an AI-powered nature relationship platform. Observe, understand, experience, and act for the living world around you.

## Tech Stack

- **React 19 + Vite 7**
- **Tailwind CSS 4** (`@tailwindcss/vite`)
- **React Router 7**
- **Supabase** — auth (email + Google), Postgres, storage
- **Gemini API** — AI image analysis (Nature Lens), mission generation, Pulse chat
- **Framer Motion** — animations
- **lucide-react** — icons

## Pages

- `/` Landing
- `/login`, `/register` — Supabase auth (email + Google)
- `/onboarding` — pick city, region, and interests
- `/app` — Dashboard (connection score, missions, places, discoveries)
- `/app/lens` — Nature Lens (AI photo analysis)
- `/app/places` — Nearby curated places
- `/app/act` — Actions
- `/app/journal` — Field journal
- `/app/stories` — Community stories
- `/app/community` — Community discussion
- `/app/pulse` — Pulse Chat (AI companion)
- `/app/settings` — Profile settings

## Setup

```bash
npm install
cp .env.example .env
```

Fill `.env` with your Supabase and Google credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_AUTH_PROXY=https://your-auth-proxy-url
```

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

The app is deployed on Vercel. The `api/` directory holds the serverless routes that talk to Supabase (they need `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` at runtime).

**Image uploads** (Nature Lens and Pulse Chat attachments) go through the serverless `api/` routes, so the Gemini key stays server-side. Set `GEMINI_API_KEY` in the Vercel dashboard — never in a `VITE_*` variable or the browser bundle. To call the serverless routes from a custom domain, set `VITE_API_URL` to the deployment origin (e.g. `https://your-app.vercel.app`). Without it the app runs in demo/mock mode.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
