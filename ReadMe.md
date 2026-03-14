# SnapLink URL Shortener

A full-stack URL shortener with analytics, built with React (Vite) on the frontend and Node.js/Express on the backend.

## Features

- Shorten long URLs into 7-character short links.
- Redirect short links to original URLs.
- Link expiration support (7 days from creation).
- Click analytics per short code (total clicks + daily timeline).
- Basic IP-based rate limiting on short-link creation.
- Redis caching for faster redirects.

## Tech Stack

### Frontend

- React 19
- Vite
- Axios
- Recharts
- React Hot Toast

### Backend

- Node.js + Express
- PostgreSQL (`pg`)
- Redis (`redis`)
- `nanoid` for short-code generation

### Containerization

- Docker (frontend + backend images)
- Docker Compose (frontend + backend + redis)

---

## Project Structure

```text
url-shortner/
├── client/                # React frontend (Vite)
├── server/                # Express backend
├── docker-compose.yml
├── load-test.js           # k6 load test script
└── ReadMe.md
```

---

## Prerequisites

Install these before running locally:

- Node.js 18+
- npm 9+
- PostgreSQL 14+
- Redis 6+
- (Optional) Docker + Docker Compose
- (Optional) k6 for load testing

---

## Environment Variables

### Backend (`server/.env`)

Create `server/.env`:

```env
DATABASE_URL=postgresql://<username>:<password>@<host>:5432/<database>
PUBLIC_BASE_URL=https://your-public-backend-host
```

Notes:

- `DATABASE_URL` is required.
- `PUBLIC_BASE_URL` is optional. Set it in production if your app is behind a proxy or load balancer and you want generated short links to use a stable public host.
- The backend currently creates Redis client with default local settings (`redis://127.0.0.1:6379`).

### Frontend (`client/.env`)

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

The client also supports `VITE_BACKEND_URL` as a legacy fallback, but `VITE_API_BASE_URL` is the preferred variable.

In production, set `VITE_API_BASE_URL` to your deployed backend URL.

---

## Database Setup

Run the following SQL in your PostgreSQL database:

```sql
CREATE TABLE IF NOT EXISTS urls (
	id BIGSERIAL PRIMARY KEY,
	original_url TEXT NOT NULL,
	short_code VARCHAR(32) UNIQUE NOT NULL,
	expires_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);

CREATE TABLE IF NOT EXISTS analytics (
	id BIGSERIAL PRIMARY KEY,
	short_code VARCHAR(32) NOT NULL,
	ip_address TEXT,
	user_agent TEXT,
	accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_short_code ON analytics(short_code);
CREATE INDEX IF NOT EXISTS idx_analytics_accessed_at ON analytics(accessed_at);
```

---

## Run Locally (Recommended)

### 1) Start Redis

If Redis is installed locally:

```bash
redis-server
```

### 2) Start Backend

```bash
cd server
npm install
npm run serve
```

Backend runs on `http://localhost:5000`.

### 3) Start Frontend

In a second terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs on Vite default URL (typically `http://localhost:5173`).

---

## API Reference

Base URL: `http://localhost:5000`

### `POST /`

Create a short URL.

Request body:

```json
{
  "originalUrl": "https://example.com/very/long/path"
}
```

Success response (`201`):

```json
{
  "shortUrl": "https://your-public-host/AbC1234"
}
```

Possible errors:

- `400` Invalid URL format
- `429` Too many requests (rate limit)
- `500` Database error

### `GET /:shortCode`

Redirects to the original URL.

Possible responses:

- `302` Redirect success
- `404` URL not found
- `410` Link expired

### `GET /analytics/:shortCode`

Returns click analytics grouped by date.

Success response (`200`):

```json
{
  "totalClicks": 12,
  "timeline": [
    { "date": "2026-03-12", "clicks": "5" },
    { "date": "2026-03-13", "clicks": "7" }
  ]
}
```

---

## Docker Setup

```bash
docker compose up --build
```

Expected ports:

- Frontend: `http://localhost`
- Backend: `http://localhost:5000`
- Redis: `localhost:6379`

### Important Docker Notes

- Ensure the backend gets a valid `DATABASE_URL` value.
- The current backend code uses default Redis connection settings; if backend runs in Docker, Redis host handling may need alignment with compose networking.

---

## Load Testing (k6)

The root `load-test.js` script simulates:

- 100 virtual users
- 30 seconds duration

Run:

```bash
k6 run load-test.js
```

Before running, update the short code in `load-test.js` to a valid existing one.

---

## Available Scripts

### Backend (`server/package.json`)

- `npm run serve` — start backend server

### Frontend (`client/package.json`)

- `npm run dev` — start Vite dev server
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

---

## Troubleshooting

- **`Invalid URL format` on create**: Verify request body is `{ "originalUrl": "https://..." }`.
- **DB connection failed**: Confirm `DATABASE_URL` and PostgreSQL accessibility.
- **Redis connection warning**: App continues without cache, but rate limiting/caching become less effective.
- **Frontend cannot reach backend**: Check `VITE_API_BASE_URL` and backend port.
- **No analytics shown**: Make sure redirects have occurred for that short code.

---

## License

ISC
