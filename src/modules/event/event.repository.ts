import { Queryable, pool } from "../../config/db";

export interface EventRecord {
  id: number;
  title: string;
  description: string;
  category: string;
  date: Date;
  location: string;
  total_seats: number;
  available_seats: number;
  price: string; 
  organizer_id: number;
  created_at: Date;
  updated_at: Date;
}

export type EventChanges = Partial<{
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
  total_seats: number;
  available_seats: number;
  price: number;
}>;


const UPDATABLE_COLUMNS = [
  "title",
  "description",
  "category",
  "date",
  "location",
  "total_seats",
  "available_seats",
  "price",
] as const;

export const eventRepository = {
  async create(
    data: {
      title: string;
      description: string;
      category: string;
      date: string;
      location: string;
      total_seats: number;
      price: number;
    },
    organizerId: number
  ): Promise<EventRecord> {
    const result = await pool.query<EventRecord>(
      `INSERT INTO events
         (title, description, category, date, location,
          total_seats, available_seats, price, organizer_id)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8)
       RETURNING *`,
      [
        data.title,
        data.description,
        data.category,
        data.date,
        data.location,
        data.total_seats,
        data.price,
        organizerId,
      ]
    );
    return result.rows[0];
  },

  async findAll(searchPattern: string | null): Promise<EventRecord[]> {
    const result = await pool.query<EventRecord>(
      `SELECT * FROM events
       WHERE ($1::text IS NULL OR title ILIKE $1 OR description ILIKE $1)
       ORDER BY created_at DESC, id DESC`,
      [searchPattern]
    );
    return result.rows;
  },

  async findByIdWithOrganizer(id: number) {
    const result = await pool.query<
      EventRecord & { organizer_name: string; organizer_email: string }
    >(
      `SELECT e.*, u.name AS organizer_name, u.email AS organizer_email
       FROM events e
       JOIN users u ON u.id = e.organizer_id
       WHERE e.id = $1`,
      [id]
    );

    const row = result.rows[0];
    if (!row) return null;

    const { organizer_name, organizer_email, created_at, updated_at, ...event } =
      row;

    return {
      ...event,
      organizer: {
        id: event.organizer_id,
        name: organizer_name,
        email: organizer_email,
      },
      created_at,
      updated_at,
    };
  },

  
  async findByIdForUpdate(
    id: number,
    db: Queryable
  ): Promise<EventRecord | null> {
    const result = await db.query<EventRecord>(
      "SELECT * FROM events WHERE id = $1 FOR UPDATE",
      [id]
    );
    return result.rows[0] ?? null;
  },

  async sumConfirmedTickets(eventId: number, db: Queryable): Promise<number> {
    const result = await db.query<{ sold: number }>(
      `SELECT COALESCE(SUM(tickets_booked), 0)::int AS sold
       FROM bookings
       WHERE event_id = $1 AND status = 'confirmed'`,
      [eventId]
    );
    return result.rows[0].sold;
  },

  async hasConfirmedBookings(eventId: number, db: Queryable): Promise<boolean> {
    const result = await db.query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM bookings
         WHERE event_id = $1 AND status = 'confirmed'
       ) AS exists`,
      [eventId]
    );
    return result.rows[0].exists;
  },

  async update(
    id: number,
    changes: EventChanges,
    db: Queryable
  ): Promise<EventRecord> {
    const sets: string[] = [];
    const values: unknown[] = [];

    for (const column of UPDATABLE_COLUMNS) {
      const value = changes[column];
      if (value !== undefined) {
        values.push(value);
        sets.push(`${column} = $${values.length}`);
      }
    }

    sets.push("updated_at = NOW()");
    values.push(id);

    const result = await db.query<EventRecord>(
      `UPDATE events SET ${sets.join(", ")}
       WHERE id = $${values.length}
       RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async deleteById(id: number, db: Queryable): Promise<void> {
    await db.query("DELETE FROM events WHERE id = $1", [id]);
  },
};