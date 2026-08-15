<div align="center">

<img src="https://img.shields.io/badge/NaturePulse-Discover%20the%20World%20Around%20You-1a1a2e?style=for-the-badge&logo=leaf&logoColor=7CFC98" alt="NaturePulse Banner" width="100%"/>

# 🌿 NaturePulse

### *Discover the world already around you.*

**AI-powered Nature Relationship Platform** — Observe, understand, experience, and act for the living world around you, without inventing species names or exposing exact locations.

<br/>

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Coming%20Soon-4f46e5?style=for-the-badge)]()
[![Frontend](https://img.shields.io/badge/▲%20Vercel-Frontend%20Deploy-000000?style=for-the-badge&logo=vercel)]()
[![Backend](https://img.shields.io/badge/🚀%20Render-Backend%20API-46e3b7?style=for-the-badge&logo=render)]()
[![YouTube](https://img.shields.io/badge/▶%20YouTube-Demo%20Video-FF0000?style=for-the-badge&logo=youtube)]()
[![GitHub Repo](https://img.shields.io/badge/⭐%20GitHub-Source%20Code-181717?style=for-the-badge&logo=github)]()

<br/>

![React](https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite%207-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router%207-CA4245?style=flat-square&logo=reactrouter&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini%20API-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)

</div>

---

## 🔗 Quick Links

| Resource | Link |
|---|---|
| 🌐 **Live App (Production)** | Coming Soon |
| ▲ **Frontend Deploy (Vercel)** | `<!-- add your Vercel URL -->` |
| 🚀 **Backend API (Render)** | `<!-- add your Render URL -->` |
| 📦 **Frontend Repository** | [`frontend/`](./frontend) |
| 🗄️ **Backend Repository** | [`backend/`](./backend) |
| ▶️ **YouTube Demo** | Coming Soon |
| 📄 **API Health Check** | `<!-- add health-check / Postman link -->` |
| 🏆 **Built For** | ORGENHACKS 2026 |

---

## 📖 About the Project

**NaturePulse** turns everyday surroundings into a quiet layer of discovery. It helps people observe, understand, experience, and act for the living world already around them — grounded in an honest, hedged approach that never invents species names or exposes exact locations.

The project ships as two apps: **NaturePulse**, a React + Vite + Supabase + Gemini frontend built around the journey *Observe → Understand → Experience → Act → Measure → Return*, and **Green Watch API**, a Node.js + Express + MongoDB backend for community environmental issue reporting and resolution tracking.

## Problem

People walk past the living world every day without a simple, honest way to notice it, understand it, or act on it — and most "nature ID" tools overreach, confidently naming species or exposing sensitive locations they shouldn't.

## Solution

NaturePulse gives people a quiet, trustworthy layer over their surroundings: a hedged AI read on what they've found, curated nearby places, one modest local action to take, and a personal journal to track the relationship over time — paired with Green Watch, a way for the same community to report and resolve local environmental issues. 🌱

---

## 🎬 Demo

<div align="center">

[![NaturePulse Demo Video](https://img.shields.io/badge/▶%20Watch%20Full%20Demo%20on%20YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)]()

> Demo video coming soon.

</div>

---

## 🛠 Tech Stack

### Frontend — NaturePulse
| Technology | Purpose |
|---|---|
| **React 19 + Vite 7** | UI and build tooling |
| **Tailwind CSS 4** (`@tailwindcss/vite`) | Utility-first styling |
| **React Router 7** | Client-side routing |
| **Supabase** | Auth (email + Google), Postgres, and storage |
| **Gemini API** | Image analysis, mission generation, and chat |
| **Framer Motion** | Animations |
| **Vercel** | Deployment (serverless API routes in `api/`) |

### Backend — Green Watch API
| Technology | Purpose |
|---|---|
| **Node.js + Express.js** | REST API server & routing |
| **MongoDB + Mongoose** | Database & ODM — schema modeling & query building |
| **JWT + bcrypt** | Authentication & role-based access (citizen / admin) |
| **Cloudinary** | Image uploads (images only, max 5 MB) |
| **express-rate-limit + Helmet + CORS** | Auth-route rate limiting & security headers |

### Deployment & Infrastructure
| Service | Role |
|---|---|
| **Vercel** | Frontend hosting + serverless API routes |
| **Render / Railway** | Green Watch backend hosting |
| **Supabase** | Managed Postgres, auth, and storage |
| **MongoDB Atlas** | Managed cloud database for Green Watch |

---

## ✨ Features

### 🌿 NaturePulse (Frontend)
- 🔍 **Nature Lens** — snap a photo and get an honest, hedged AI read on what you found (Gemini), with a "we don't invent species names" stance
- 📍 **Nearby** — browse curated local places by habitat, type, and city
- ✅ **Act** — one modest, legal, local action keeps the relationship honest
- 📓 **Journal** — keep a quiet record of visits, notes, and return dates
- 📖 **Stories** — read and share community nature stories
- 💬 **Community** — discuss and share with other members
- 🤖 **Pulse Chat** — talk to an AI companion grounded in your own discoveries and missions
- 📊 **Nature Connection Score** — measured across Observe, Explore, Learn, Act, and Return dimensions
- 🧭 **Onboarding** — personalize with city, region, and interests
- 🌙 **Theming** — light/dark mode, mobile-first layout

### 🛡️ Green Watch (Backend)
- 🔐 **JWT Authentication** — bcrypt-hashed passwords with role-based access (citizen / admin)
- 📢 **Issue Reporting** — categories, geo-location, images, upvotes, and a `reported → acknowledged → in_progress → resolved` status workflow
- 💬 **Comments** — threaded discussion on each reported issue
- 📊 **Admin Analytics** — live aggregation stats and a public leaderboard
- 🖼️ **Image Uploads** — Cloudinary-backed, images only, max 5 MB
- 🛡️ **Security** — rate limiting on auth routes, Helmet, CORS
- 🌱 **Seed Script** — idempotent demo data for admin, citizens, issues, and comments

---

## 🏗 Architecture

```
                    ┌──────────────────────┐
                    │       Vercel          │
                    │  (Frontend + API/)    │
                    │  React 19 + Vite 7    │
                    └──────────┬───────────┘
                       │                 │
             Supabase (auth/DB) │ HTTPS (REST)
                       │                 │
        ┌──────────────▼───┐   ┌────────▼────────────┐
        │     Supabase       │   │   Render/Railway     │
        │ Postgres + Storage │   │  Green Watch API      │
        │                     │   │  Node.js + Express    │
        └────────────────────┘   └──────────┬───────────┘
                                             │ Mongoose Driver
                                  ┌──────────▼───────────┐
                                  │    MongoDB Atlas       │
                                  │  (Cloud Database)      │
                                  └────────────────────────┘
```

---

## 📡 API Documentation — Green Watch

**Base URL:** `/api`

### 🔐 Auth Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Create account |
| `POST` | `/auth/login` | No | Login, returns `{user, token}` |
| `GET` | `/auth/me` | Yes | Current user |

### 📢 Issues Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` / `POST` | `/issues` | Read: no / Write: yes | List or create issues |
| `GET` | `/issues/:id` | No | Issue detail |
| `PATCH` / `DELETE` | `/issues/:id` | Owner/admin | Edit / soft-delete |
| `POST` | `/issues/:id/upvote` | Yes | Toggle upvote |
| `PATCH` | `/issues/:id/status` | Admin | Change status |
| `GET` / `POST` | `/issues/:id/comments` | Read: no / Write: yes | Comments |

### 📊 Admin Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | Admin | Live aggregation |
| `GET` | `/admin/leaderboard` | No | Top reporters |

### 🖼️ Upload Endpoint

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/upload` | Yes | Upload image → `{url}` |

Full API reference (request/response examples, filters, env vars) lives in [`backend/README.md`](./backend/README.md). A Postman collection is at `backend/postman_collection.json`.

---

## 📁 Project Structure

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

### Supabase schema (`np_` tables)

`np_profiles`, `np_discoveries`, `np_missions`, `np_places`, `np_journal`, `np_stories`, `np_community`, `np_scores`, `np_actions`, `np_pulse`

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- npm v9+
- Supabase project (auth + Postgres + storage)
- MongoDB Atlas account (or local MongoDB)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/naturepulse.git
cd naturepulse
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# fill in your .env values

npm run dev                        # runs on http://localhost:5173
```

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# fill in your .env values

npm run dev                        # development (nodemon)
npm start                          # production
npm run seed                       # idempotent demo data
```

Backend runs on `PORT` (default 5000). Seed admin: `admin@greenwatch.app` / `Admin@12345`

---

## 🔧 Environment Variables

### Frontend `.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_AUTH_PROXY=https://your-auth-proxy-url
```

The `api/` directory (serverless routes used by the deployed app) reads `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the environment.

### Backend `.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/greenwatch
JWT_SECRET=your-super-strong-random-secret-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=development
```

---

## 🌐 Deployment

### Frontend → Vercel

```bash
npm i -g vercel
cd frontend
vercel --prod
```

Set the Supabase and Google auth environment variables in the Vercel dashboard.

### Backend → Render

1. Push backend repo to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your backend repository
4. Build command: `npm install` | Start command: `npm start`
5. Add all environment variables from `.env`

---

## 🖼 Screenshots

| Page | Preview |
|---|---|
| 🏠 Home / Nature Lens | _(coming soon)_ |
| 📍 Nearby | _(coming soon)_ |
| 📓 Journal | _(coming soon)_ |
| 📖 Stories | _(coming soon)_ |
| 🤖 Pulse Chat | _(coming soon)_ |
| 📢 Green Watch — Issue Feed | _(coming soon)_ |
| 📊 Green Watch — Admin Analytics | _(coming soon)_ |

<p align="center">
  <img src="./docs/screenshots/naturepulse-preview.png" alt="NaturePulse App Preview" width="800"/>
</p>

<!-- Add your screenshot to /docs/screenshots/naturepulse-preview.png -->

---

## 🔒 Security

- ✅ Supabase-managed auth (email + Google) on the frontend
- ✅ JWT + bcrypt password hashing on Green Watch
- ✅ Role-based access control (citizen / admin)
- ✅ Rate limiting on auth routes, Helmet security headers, CORS
- ✅ Image uploads restricted to images only, max 5 MB, via Cloudinary
- ✅ No raw queries — all Green Watch data access via Mongoose ODM
- ✅ `.env` files gitignored in both apps — never commit real secrets

---

## 🗺 Roadmap

- [ ] Offline-first Nature Lens capture queue
- [ ] Push notifications for mission reminders and return dates
- [ ] Expanded Nearby data sources beyond curated city lists
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Public API access with API key management

---

## 🤝 Contributing

Contributions are welcome! Please follow this workflow:

```bash
git checkout -b feat/your-feature-name
git commit -m "feat(journal): add return-date reminders"
git push origin feat/your-feature-name
```

Commit convention: `feat | fix | chore | docs | refactor | test`

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<div align="center">

**Built with 🌿 for ORGENHACKS 2026**

[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github)]()
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)]()
[![YouTube](https://img.shields.io/badge/YouTube-Demo%20Video-FF0000?style=for-the-badge&logo=youtube)]()

> *"Discover the world already around you."*

⭐ **Star this repo if you found it useful!**

</div>
