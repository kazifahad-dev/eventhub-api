import { z } from "zod";

export const createBookingSchema = z.object({
  event_id: z
    .number({ error: "Event id must be a number" })
    .int("Event id must be an integer")
    .min(1, "Event id must be at least 1")
    .max(2147483647, "Event id is too large"),
  tickets_booked: z
    .number({ error: "Tickets booked must be a number" })
    .int("Tickets booked must be an integer")
    .min(1, "Must be at least 1")
    .max(2147483647, "Tickets booked is too large"),
});

export const bookingIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, "Invalid id")
    .refine((v) => Number(v) <= 2147483647, "Invalid id"),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;