CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        VARCHAR(20) NOT NULL DEFAULT 'attendee'
              CHECK (role IN ('attendee', 'organizer')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id               SERIAL PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  description      TEXT NOT NULL,
  category         VARCHAR(100) NOT NULL,
  date             TIMESTAMPTZ NOT NULL,
  location         VARCHAR(255) NOT NULL,
  total_seats      INTEGER NOT NULL CHECK (total_seats > 0),
  available_seats  INTEGER NOT NULL,
  price            NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  organizer_id     INTEGER NOT NULL REFERENCES users(id),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT available_seats_range
    CHECK (available_seats >= 0 AND available_seats <= total_seats)
);

CREATE TABLE IF NOT EXISTS bookings (
  id              SERIAL PRIMARY KEY,
  event_id        INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_id     INTEGER NOT NULL REFERENCES users(id),
  tickets_booked  INTEGER NOT NULL CHECK (tickets_booked > 0),
  total_price     NUMERIC(10, 2) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed', 'cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_attendee ON bookings(attendee_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id);