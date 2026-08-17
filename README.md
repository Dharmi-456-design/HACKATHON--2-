<div align="center">

<img src="https://img.shields.io/badge/NaturePulse-Discover%20the%20World%20Around%20You-1C3727?style=for-the-badge&logo=leaf&logoColor=96CD7B" alt="NaturePulse Banner" width="100%"/>

# 🌿 NaturePulse — AI Nature Relationship Platform & GreenWatch Engine

### *Discover the living world already around you.*

**NaturePulse** is an ultra-modern, full-stack AI nature relationship platform built for urban explorers, field naturalists, and civic stewards. Designed around the core philosophy **"A relationship, not a streak"**, NaturePulse guides users to **Observe, Understand, Experience, Act, Measure, and Return** to their local ecosystems.

<br/>

[![🌐 Live Web App](https://img.shields.io/badge/Live_App-naturepulse.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://naturepulse.vercel.app/)
[![🚀 Live API](https://img.shields.io/badge/Live_API-naturpulse.onrender.com-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://naturpulse.onrender.com)
[![React 19](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite 7](https://img.shields.io/badge/Vite-7.3.6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-v22-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%26%20Local-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-Vision_AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

[🌐 Live App](https://naturepulse.vercel.app/) •
[🚀 Live API](https://naturpulse.onrender.com) •
[✨ Features](#-key-features) •
[🏗 Architecture](#-system-architecture) •
[📂 Directory Structure](#-directory-structure) •
[📡 API Reference](#-api-documentation--greenwatch-rest-api) •
[🚀 Quick Start](#-getting-started) •
[🔒 Privacy & Security](#-privacy--security-ethics)

</div>

---

## 🔗 Live Deployments

| Service | Platform | URL | Status |
|---|---|---|---|
| **Frontend Web Application** | Vercel | [https://naturepulse.vercel.app/](https://naturepulse.vercel.app/) | ![Vercel](https://img.shields.io/badge/Deployed-Live-success?style=flat-square&logo=vercel) |
| **Backend REST API** | Render | [https://naturpulse.onrender.com](https://naturpulse.onrender.com) | ![Render](https://img.shields.io/badge/Deployed-Live-success?style=flat-square&logo=render) |
| **Health Check Endpoint** | Render | [https://naturpulse.onrender.com/api/health](https://naturpulse.onrender.com/api/health) | ![Health](https://img.shields.io/badge/Status-200%20OK-brightgreen?style=flat-square) |

---

## 📌 Executive Overview

In modern urban life, people walk past living ecosystems every day without a simple, honest way to notice or protect them. Existing apps either gamify nature into stressful streaks, overclaim species identifications with false certainty, or expose sensitive location data.

**NaturePulse solves this with a two-tier architecture:**
1. **NaturePulse Web Application (`/frontend`)**: An immersive, dark-themed React 19 SPA featuring a spotlight reveal hero, 3D flip card loops, interactive AI species vision (Nature Lens), spatial radar compass for curated local sanctuaries, and 5-dimensional nature connection telemetry.
2. **GreenWatch Engine & REST API (`/backend`)**: A Node.js + Express + MongoDB backend powering the NaturePulse platform (auth, missions, journal, actions, discoveries, community, AI) and GreenWatch civic reporting (litter, pollution, illegal dumping tracked `reported` → `acknowledged` → `in_progress` → `resolved`).

---

## ✨ Key Features

### 🍃 Frontend — NaturePulse Web Application (`frontend/`)

- 🔍 **Nature Lens (AI Photo Telemetry)** — Snap or upload plant, avian, or fungal photos for an honest, hedged AI read powered by Google Gemini Vision. Never hallucinates false Latin names or guarantees unverified species.
- 🎯 **Lithos Spotlight Cursor Hero** — Interactive spotlight cursor effect revealing secondary geological textures through soft circular masking.
- 📡 **Nearby Discovery Radar Compass** — Spatial radar map displaying curated study sanctuaries, Peepal canopies, and eco-retreats with walk-time breakdowns and 3D hover flip details. Multilingual support for English, Gujarati (`gu`), and Hindi (`hi`).
- 🤖 **Pulse AI Field Companion** — Context-aware AI chat assistant providing 10-minute field protocols tailored to local weather, time of day, and logged observations.
- 📊 **5D Nature Connection Score** — Visual radar telemetry measuring growth across 5 core dimensions: *Observe, Explore, Learn, Act, and Return*.
- 💬 **Liquid Equalizer Community Ticker** — Continuous Gaussian wave equalizer scrubber with staircase card offsets and an interactive 12+ review modal (`ReviewsModal.jsx`).
- 📢 **GreenWatch Civic Reporting Hub** — Public environmental reporting interface with real-time location mapping, image attachments, upvotes, and status filters.
- 📓 **Field Journal & Biodiversity Passport** — Private journal for visit logs, return date reminders, micro-habitat badges, and species taxonomy logs.
- 🎬 **Parallax CTA & Video Showcase** — Glassmorphism liquid frosted surfaces with background video and parallax grass horizon.
- 💳 **Hackathon Pricing Section** — Budget-friendly plans: *Explorer (Free Forever)*, *Habitat Pro ($4.99/mo)*, and *Sanctuary Team ($39/yr)*.

### 🛡️ Backend — GreenWatch REST API (`backend/`)

- 🔐 **JWT & Bcrypt Security** — Secure password hashing with role-based access control (`citizen` vs `admin`) and Supabase OAuth session bridge.
- 🗺️ **Environmental Issue Workflow** — Endpoints for issue creation, geospatial coordinate tracking, upvoting, threading comments, and status transitions.
- 📊 **Admin Analytics & Leaderboards** — Real-time MongoDB aggregation pipelines calculating resolution rates, category breakdowns, and top civic contributors.
- 🖼️ **Cloudinary Media Storage** — Upload middleware restricting file types to images with strict 5 MB file size limits.
- 🛡️ **Production Protection & Fallbacks** — Automatic MongoDB Atlas & Local failover connection, rate limiting on auth routes (`express-rate-limit`), Helmet security headers, CORS origin restriction, and Mongoose schema validation.
- 🌿 **Idempotent Seeding System** — Automated demo data generator (`npm run seed`) creating pre-configured admin accounts, citizen profiles, issues, and threaded comments.

---

## 🏗 System Architecture

```
                                  ┌──────────────────────────────────┐
                                  │      Client (Browser / PWA)      │
                                  │   React 19 + Tailwind CSS 4      │
                                  │   https://naturepulse.vercel.app │
                                  └────────────────┬─────────────────┘
                                                   │
                         ┌─────────────────────────┴─────────────────────────┐
                         ▼                                                   ▼
         ┌───────────────────────────────┐                   ┌───────────────────────────────┐
         │     Vercel Serverless / API   │                   │   GreenWatch REST API Server  │
         │      (Supabase & Gemini)      │                   │   https://naturpulse.onrender │
         └───────────────┬───────────────┘                   └───────────────┬───────────────┘
                         │                                                   │
         ┌───────────────┴───────────────┐                   ┌───────────────┴───────────────┐
         ▼                               ▼                   ▼                               ▼
  ┌─────────────┐                 ┌─────────────┐     ┌─────────────┐                 ┌─────────────┐
  │  Supabase   │                 │ Google      │     │  MongoDB    │                 │ Cloudinary  │
  │ Auth & DB   │                 │ Gemini AI   │     │ Atlas/Local │                 │ Media CDN   │
  └─────────────┘                 └─────────────┘     └─────────────┘                 └─────────────┘
```

---

## 📂 Directory Structure

```
HACKATHON--2-/
├── README.md                           # Main Project Architecture & Documentation
├── NaturePulse_Postman_Collection.json # Complete Postman API testing collection
├── backend/                            # GreenWatch REST API (Express + MongoDB)
│   ├── seed.js                         # Idempotent database seeder script
│   ├── package.json                    # Backend dependencies & scripts
│   └── src/
│       ├── server.js                   # Express server entry point
│       ├── config/                     # Database & Cloudinary configurations
│       │   ├── db.js                   # MongoDB connection handler with auto-failover
│       │   └── cloudinary.js           # Cloudinary SDK storage setup
│       ├── controllers/                # Business logic request handlers
│       │   ├── adminController.js      # Analytics aggregations & leaderboards
│       │   ├── authController.js       # Register, login, me & google OAuth
│       │   ├── commentController.js    # Threaded issue comments
│       │   ├── issueController.js      # Environmental issue CRUD & upvotes
│       │   ├── natureController.js     # Species, telemetry, missions & profile
│       │   └── uploadController.js     # Image upload controller
│       ├── middleware/                 # Middleware pipeline
│       │   ├── authMiddleware.js       # JWT validation & role authorization
│       │   ├── errorMiddleware.js      # Global error handling middleware
│       │   └── uploadMiddleware.js     # Multer image validation (max 5MB)
│       ├── models/                     # Mongoose Schemas
│       │   ├── Comment.js              # Issue comment schema
│       │   ├── Issue.js                # Environmental issue schema
│       │   ├── Nature.js               # Nature telemetry & species schema
│       │   ├── Notification.js         # User alert schema
│       │   └── User.js                 # User account & role schema
│       ├── routes/                     # Express API Route Definitions
│       │   ├── adminRoutes.js          # /api/admin endpoints
│       │   ├── authRoutes.js           # /api/auth endpoints
│       │   ├── commentRoutes.js        # /api/issues/:id/comments endpoints
│       │   ├── issueRoutes.js          # /api/issues endpoints
│       │   ├── natureRoutes.js         # /api (profile, discoveries, places, pulse)
│       │   └── uploadRoutes.js         # /api/upload endpoints
│       ├── utils/                      # JWT generation & async wrappers
│       └── validators/                 # Express-validator input schemas
│
└── frontend/                           # NaturePulse Web App (React 19 + Vite 7)
    ├── index.html                      # HTML entry with Google Fonts & Meta Tags
    ├── package.json                    # Frontend dependencies & scripts
    ├── vite.config.js                  # Vite 7 build configuration
    ├── public/                         # Public static images, video & assets
    └── src/
        ├── App.jsx                     # Route declaration & AppShell provider
        ├── main.jsx                    # React 19 root render entry point
        ├── index.css                   # Global styles & Tailwind CSS 4 directives
        ├── components/                 # Reusable Interface Components
        │   ├── AnimatedStatCard.jsx    # Animated counter stats badge
        │   ├── AppShell.jsx            # Main app sidebar & topbar layout wrapper
        │   ├── BestTimeToExplore.jsx   # Solar & weather exploration indicator
        │   ├── CtaSection.jsx          # Parallax CTA section with video
        │   ├── ExplorerStreak.jsx      # Daily streak counter component
        │   ├── HorizontalReviewsTicker.jsx # Gaussian equalizer scrubber & reviews
        │   ├── Interactive3DFooter.jsx # 3D ecosystem interactive footer
        │   ├── LithosHero.jsx          # Cursor-following spotlight reveal hero
        │   ├── Navbar.jsx              # Top leftmost logo navbar with pill links
        │   ├── PricingSection.jsx      # Tiered hackathon pricing plans
        │   ├── ProtectedRoute.jsx      # Auth state route guard
        │   ├── ReviewsModal.jsx        # Verified reviews filterable modal
        │   ├── ScrollTypographyHighlight.jsx # Smooth scroll text reveal
        │   ├── SplashIntro.jsx         # Introductory splash animation
        │   ├── ThemeToggle.jsx         # Light/Dark mode switcher
        │   └── ui.jsx                  # Atomic UI components & PulseOrb
        ├── contexts/                   # Global React State Contexts
        │   ├── AuthContext.jsx         # Supabase & backend user auth state
        │   └── ThemeContext.jsx        # Dark/Light theme provider
        ├── lib/                        # API Clients & SDK Helpers
        │   ├── api.js                  # Fetch API client wrapper
        │   └── supabase.js             # Supabase Client SDK setup
        └── pages/                      # Application Route Views
            ├── Act.jsx                 # Local stewardship actions view
            ├── BiodiversityPassport.jsx # Badges & species passport view
            ├── Community.jsx           # Explorer community discussion forum
            ├── CommunityBiodiversityMap.jsx # Real-time species map view
            ├── Dashboard.jsx           # Main home base & 5D connection score
            ├── Journal.jsx             # Private field notes & visit journal
            ├── Landing.jsx             # Landing page assembly view
            ├── Lens.jsx                # Nature Lens AI photo analysis
            ├── Login.jsx               # User sign-in interface
            ├── NatureMissions.jsx      # Daily AI generated field missions
            ├── Onboarding.jsx          # City & interest personalization view
            ├── PlaceDetails.jsx        # Single sanctuary detailed view
            ├── Places.jsx              # Nearby discovery radar compass view
            ├── PulseChat.jsx           # Pulse AI companion conversation view
            ├── Register.jsx            # Account creation interface
            ├── ResetPassword.jsx       # Password reset flow
            ├── Settings.jsx            # Account profile & preferences
            ├── Stories.jsx             # Community ecological stories view
            └── WeeklyRecap.jsx         # AI weekly analytics & recap view
```

---

## 📡 API Documentation — GreenWatch REST API

- **Production Base URL:** `https://naturpulse.onrender.com/api`
- **Local Base URL:** `http://localhost:5000/api`

### 🔐 Auth Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create new user account (`citizen` or `admin`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `POST` | `/api/auth/google` | Public | Bridge & verify Supabase Google OAuth session |
| `GET` | `/api/auth/me` | User | Retrieve authenticated user profile |

### 🌿 Nature & Field Observation Endpoints
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/profile` | User | Get explorer profile & onboarding status |
| `PUT` | `/api/profile` | User | Update explorer profile, city, & goals |
| `GET` | `/api/discoveries` | Public | List verified community flora/fauna discoveries |
| `POST` | `/api/discoveries` | User | Log a new field observation with photo |
| `GET` | `/api/places` | Public | Curated study sanctuaries with GPS coordinates |
| `GET` | `/api/places/:id` | Public | Sanctuary detailed guide & best hours |
| `GET` | `/api/missions` | User | Daily personalized 10-minute field missions |
| `GET` | `/api/journal` | User | Private field notes & sensory log |
| `GET` | `/api/connection` | User | 5D Nature Connection Score telemetry |
| `GET` | `/api/streak` | User | Explorer streak & active days tracker |
| `GET` | `/api/stats` | Public | Live community telemetry counter |
| `GET` | `/api/testimonials` | Public | Verified community observation quotes |
| `POST` | `/api/pulse` | Public (Rate-Limited) | Pulse AI field companion chat assistant |
| `POST` | `/api/analyze` | Public (Rate-Limited) | Nature Lens species vision telemetry |

### 📢 Environmental Issues Endpoints (GreenWatch)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/issues` | Public | List issues (supports search, category, & status filters) |
| `POST` | `/api/issues` | User | Report new environmental issue with coordinates & image |
| `GET` | `/api/issues/:id` | Public | Fetch detailed information for a specific issue |
| `PATCH` | `/api/issues/:id` | Owner/Admin | Update issue details or location |
| `DELETE` | `/api/issues/:id` | Owner/Admin | Soft-delete an issue report |
| `POST` | `/api/issues/:id/upvote` | User | Toggle upvote for issue prioritization |
| `PATCH` | `/api/issues/:id/status` | Admin Only | Transition status (`reported` → `acknowledged` → `in_progress` → `resolved`) |

### 🖼️ File Upload Endpoint
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/upload` | User | Upload image to Cloudinary (returns hosted image URL) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

---

### 1. Clone & Prepare Repository
```bash
git clone https://github.com/Dharmi-456-design/HACKATHON--2-.git
cd HACKATHON--2-
```

---

### 2. Backend Setup (`backend/`)
```bash
cd backend
npm install
```

Configure your `backend/.env` file:
```env
PORT=5000
# Automatic failover: Will attempt Atlas first, and smoothly fallback to local MongoDB if offline
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.em7zd3b.mongodb.net/greenwatch?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
SUPABASE_URL=https://your_supabase_project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the backend database seeder and start development server:
```bash
# Seed initial demo data (Sanctuaries, Missions, Admin accounts)
npm run seed

# Start Express API server (runs on http://localhost:5000)
npm run dev
```

---

### 3. Frontend Setup (`frontend/`)
```bash
cd ../frontend
npm install
```

Configure your `frontend/.env` file:
```env
# Point to local server or deployed Render backend
VITE_API_URL=http://localhost:5000
# For production:
# VITE_API_URL=https://naturpulse.onrender.com

# Supabase Auth configuration
VITE_SUPABASE_URL=https://your_supabase_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Start the Vite development server:
```bash
# Start frontend application (runs on http://localhost:5173)
npm run dev
```

---

## 🔒 Privacy & Security Ethics

NaturePulse enforces strict ethical guidelines for AI vision and ecological telemetry:
1. **Location Coarsening**: User locations are stored strictly at the city/neighborhood level. Exact home street addresses are never recorded or pinned to public maps.
2. **Cautious Species Vision**: Nature Lens evaluates photos with deliberate hedging. If an image is blurry or ambiguous, the AI presents broader family taxonomy rather than hallucinating false Latin species names.
3. **No Gamified Pressure**: NaturePulse intentionally eliminates artificial streak penalties, toxic leaderboards, and notification spam to foster an authentic, quiet connection with nature.

---

## 📄 License

This repository is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 🌿 for ORGENHACKS 2026**

⭐ **Explore the live platform at [naturepulse.vercel.app](https://naturepulse.vercel.app/)**

</div>
