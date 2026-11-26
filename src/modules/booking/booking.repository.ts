import { Queryable, pool } from "../../config/db";

export interface BookingRecord {
  id: number;
  event_id: number;
  attendee_id: number;
  tickets_booked: number;
  total_price: string; 
  status: "confirmed" | "cancelled";
  created_at: Date;
  updated_at: Date;
}

export const bookingRepository = {
  async create(
    eventId: number,
    attendeeId: number,
    ticketsBooked: number,
    unitPrice: string,
    db: Queryable
  ): Promise<BookingRecord> {
    
    const result = await db.query<BookingRecord>(
      `INSERT INTO bookings
         (event_id, attendee_id, tickets_booked, total_price)
       VALUES ($1, $2, $3, $4::numeric * $3::int)
       RETURNING *`,
      [eventId, attendeeId, ticketsBooked, unitPrice]
    );
    return result.rows[0];
  },

  async findByUser(userId: number) {
    const result = await pool.query<{
      id: number;
      tickets_booked: number;
      total_price: string;
      status: "confirmed" | "cancelled";
      created_at: Date;
      event_id: number;
      event_title: string;
      event_date: Date;
      event_location: string;
    }>(
      `SELECT b.id, b.tickets_booked, b.total_price, b.status, b.created_at,
              e.id AS event_id, e.title AS event_title,
              e.date AS event_date, e.location AS event_location
       FROM bookings b
       JOIN events e ON e.id = b.event_id
       WHERE b.attendee_id = $1
       ORDER BY b.created_at DESC, b.id DESC`,
      [userId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      event: {
        id: row.event_id,
        title: row.event_title,
        date: row.event_date,
        location: row.event_location,
      },
      tickets_booked: row.tickets_booked,
      total_price: row.total_price,
      status: row.status,
      created_at: row.created_at,
    }));
  },

  async findById(id: number, db: Queryable): Promise<BookingRecord | null> {
    const result = await db.query<BookingRecord>(
      "SELECT * FROM bookings WHERE id = $1",
      [id]
    );
    return result.rows[0] ?? null;
  },

  async findByIdForUpdate(
    id: number,
    db: Queryable
  ): Promise<BookingRecord | null> {
    const result = await db.query<BookingRecord>(
      "SELECT * FROM bookings WHERE id = $1 FOR UPDATE",
      [id]
    );
    return result.rows[0] ?? null;
  },

  async markCancelled(id: number, db: Queryable): Promise<BookingRecord> {
    const result = await db.query<BookingRecord>(
      `UPDATE bookings
       SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  
  async changeSeats(
    eventId: number,
    delta: number,
    db: Queryable
  ): Promise<void> {
    await db.query(
      `UPDATE events
       SET available_seats = available_seats + $1, updated_at = NOW()
       WHERE id = $2`,
      [delta, eventId]
    );
  },
};
