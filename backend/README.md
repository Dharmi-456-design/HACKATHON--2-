# Green Watch — Backend API

Community environmental issue reporting and resolution tracking platform. This is the Node.js + Express + MongoDB (Mongoose) backend for the Green Watch MVP.

## Tech Stack

- Node.js + Express
- MongoDB Atlas (Mongoose ODM)
- JWT + bcryptjs authentication
- Cloudinary for image storage
- express-validator for input validation
- helmet, cors, express-rate-limit for security

## Setup

1. Clone the repo and `cd backend`.
2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env
```

4. Fill in `.env` with real values (MongoDB Atlas connection string, JWT secret, Cloudinary keys, client URL).

5. Start the server:

```bash
npm run dev        # development (nodemon)
npm start          # production
```

The server runs on `PORT` (default 5000).

## Seeding demo data

Insert an admin user, 3 citizens, 8 sample issues, and sample comments (idempotent — safe to run multiple times):

```bash
npm run seed
```

Seed admin account: `admin@greenwatch.app` / `Admin@12345`

## API Reference

### Auth

| Method | Endpoint | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | `{name, email, password}` | Create account (role defaults to `citizen`) |
| POST | `/api/auth/login` | No | `{email, password}` | Login, returns `{user, token}` |
| GET | `/api/auth/me` | Yes | — | Current user profile |

**Register example**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"password123"}'
```

**Response**

```json
{
  "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "citizen", "points": 0 },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Upload

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Yes | `multipart/form-data` with field `image` (images only, max 5MB) → `{url}` |

### Issues

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/issues` | Yes | Create an issue |
| GET | `/api/issues` | No | List issues with filters |
| GET | `/api/issues/mine` | Yes | Issues reported by the logged-in user |
| GET | `/api/issues/:id` | No | Issue detail |
| PATCH | `/api/issues/:id` | Yes (owner/admin) | Edit an issue |
| DELETE | `/api/issues/:id` | Yes (owner/admin) | Soft-delete an issue |
| POST | `/api/issues/:id/upvote` | Yes | Toggle upvote |
| PATCH | `/api/issues/:id/status` | Yes (admin) | Change status |

**Create issue example**

```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Trash near the playground",
    "description": "Plastic waste has piled up next to the slide over the weekend.",
    "category": "litter",
    "location": { "type": "Point", "coordinates": [-122.4194, 37.7749] },
    "address": "Riverside Park, San Francisco",
    "images": ["https://res.cloudinary.com/.../issue.jpg"]
  }'
```

**List issues** — supports query params:

- `category` — `litter`, `pollution`, `illegal_dumping`, `deforestation`, `water_contamination`, `other`
- `status` — `reported`, `acknowledged`, `in_progress`, `resolved`
- `search` — regex match against title/description/address
- `sort` — `recent` (default), `oldest`, `most_upvoted`
- `near` — `lng,lat` for geospatial "near me" queries
- `maxDistance` — meters (default 10000), used with `near`
- `page`, `limit` — pagination

**Response**

```json
{
  "issues": [ ... ],
  "total": 12,
  "page": 1,
  "pages": 2,
  "limit": 10
}
```

### Comments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/issues/:id/comments` | Yes | `{text}` (max 500 chars) |
| GET | `/api/issues/:id/comments` | No | List comments |

### Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/stats` | Yes (admin) | Live aggregation: total, resolvedThisWeek, byStatus, byCategory, byPriority |
| GET | `/api/admin/leaderboard` | No | Top 10 reporters by resolved-issue count / points |

**Stats response**

```json
{
  "total": 12,
  "resolvedThisWeek": 2,
  "byStatus": { "reported": 4, "acknowledged": 3, "in_progress": 2, "resolved": 3 },
  "byCategory": { "litter": 5, "pollution": 3 },
  "byPriority": { "low": 2, "medium": 6, "high": 4 }
}
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (Render injects its own) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend origin allowed by CORS |
| `NODE_ENV` | `development` / `production` |

## Security Notes

- Passwords hashed with bcrypt (10 rounds), never returned by any endpoint.
- JWT role checks happen server-side from the verified token payload — client-supplied roles are never trusted.
- Rate limiting on auth routes (100 requests / 10 min).
- Uploads restricted to image MIME types, max 5MB.
- All write endpoints validated server-side with express-validator.
