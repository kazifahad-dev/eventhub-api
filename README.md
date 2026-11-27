# 🎉 EventHive API

A modular backend for managing community events and ticket bookings, with seat-count inventory and role-based access (attendee / organizer).

- **Live URL:** <https://your-app.onrender.com>
- **Interview Video:** <video link>
- **GitHub:** <repo link>

## Tech Stack

Node.js (LTS) · TypeScript (strict) · Express 5 · PostgreSQL (native `pg` Pool, no ORM) · bcrypt · jsonwebtoken · Zod

## Architecture

Feature-based modules with a layered flow: **route → controller → service → repository**. Only the repository layer runs SQL, always with parameterized queries (`$1, $2`). Errors are handled centrally through a custom `AppError` class and one error-handling middleware.

```
src/
├── app.ts
├── server.ts
├── config/        # env + database pool
├── middleware/    # auth, validation, error handler
├── types/         # Express Request typing (req.user)
├── utils/         # AppError, sendResponse
└── modules/
    ├── auth/
    ├── event/
    └── booking/
```

## Setup

```bash
git clone <repo link>
cd eventhive-api
npm install
cp .env.example .env     # then fill in real values
```

1. Create a PostgreSQL database (NeonDB, Supabase or Aiven).
2. Run `schema.sql` in the database's SQL editor.
3. Start the server:

```bash
npm run dev        # development
npm run build && npm start   # production
```

## Environment Variables

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

## Authentication

Protected endpoints accept either `Authorization: Bearer <token>` or `Authorization: <token>`. JWT payload: `{ "id": <user id>, "role": "<role>" }`.
Missing/invalid/expired token → `401`. Valid token with wrong role → `403`.

## Response Format

Success:
```json
{ "success": true, "message": "Operation description", "data": {} }
```

Error:
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [{ "field": "tickets_booked", "message": "Must be at least 1" }]
}
```

## API Endpoints

Base path: `/api/v1`

| # | Method | Endpoint | Access |
|---|--------|----------|--------|
| 1 | POST | `/auth/signup` | Public |
| 2 | POST | `/auth/login` | Public |
| 3 | POST | `/events` | Organizer |
| 4 | GET | `/events?search=` | Public |
| 5 | GET | `/events/:id` | Public |
| 6 | PATCH | `/events/:id` | Organizer (owner) |
| 7 | DELETE | `/events/:id` | Organizer (owner) |
| 8 | POST | `/bookings` | Authenticated |
| 9 | GET | `/bookings` | Authenticated |
| 10 | PATCH | `/bookings/:id/cancel` | Authenticated (owner) |

### 1. POST `/auth/signup`
Body (`role` optional, defaults to `attendee`):
```json
{ "name": "Sarah Connor", "email": "sarah@eventhive.com", "password": "securePassword123", "role": "organizer" }
```
`201` → `data`: `id, name, email, role, created_at, updated_at`. Errors: `400` validation, `409` email already registered.

### 2. POST `/auth/login`
Body: `{ "email": "...", "password": "..." }`
`200` → `data`: `{ token, user: { id, name, email, role } }`. Errors: `400`, `401` invalid email or password.

### 3. POST `/events`
Body:
```json
{
  "title": "TypeScript Advanced Architecture",
  "description": "Deep dive into enterprise TS patterns.",
  "category": "tech",
  "date": "2026-12-10T10:00:00.000Z",
  "location": "Dhaka Tech Hub",
  "total_seats": 50,
  "price": 1500.00
}
```
`201` → created event (`available_seats = total_seats`, `price` as string `"1500.00"`, `organizer_id` from the token). Errors: `400`, `401`, `403`.

### 4. GET `/events`
Optional `search` does a case-insensitive partial match on title or description. Newest first. `200`, empty result returns `"data": []`.

### 5. GET `/events/:id`
`200` → event with nested `organizer: { id, name, email }`. Errors: `400` invalid id, `404`.

### 6. PATCH `/events/:id`
Updatable: `title, description, category, date, location, total_seats, price` (at least one). When `total_seats` changes: `available_seats = new_total_seats - tickets_sold`. Errors: `400` (empty body, or total below tickets sold), `401`, `403` not owner, `404`.

### 7. DELETE `/events/:id`
`200` with `"data": null`. Errors: `400` event has confirmed bookings, `401`, `403`, `404`.

### 8. POST `/bookings`
Body: `{ "event_id": 1, "tickets_booked": 2 }`
`201` → booking with `total_price = price × tickets_booked` (e.g. `"3000.00"`), `status: "confirmed"`.
Errors: `400` (validation / insufficient seats / event already passed), `401`, `403` (organizer booking own event), `404`.

### 9. GET `/bookings`
`200` → the caller's bookings, newest first, each with nested `event: { id, title, date, location }`.

### 10. PATCH `/bookings/:id/cancel`
`200` → booking with `status: "cancelled"`; tickets return to the event's `available_seats`.
Errors: `400` (invalid id / event already started), `401`, `403`, `404`, `409` already cancelled.

## Key Design Decisions

- **No overselling:** booking and cancellation run inside a database transaction that locks the event row (`SELECT ... FOR UPDATE`), so concurrent requests cannot take the same seat.
- **Database-level integrity:** `CHECK`, `UNIQUE`, `NOT NULL` and foreign keys in `schema.sql` back up the application checks.
- **Safe errors:** unexpected failures return a generic `500`; stack traces and raw SQL errors are never exposed.

## Database Schema

See [`schema.sql`](./schema.sql) for the full `CREATE TABLE` statements.