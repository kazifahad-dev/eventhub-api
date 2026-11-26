import { z } from "zod";

const requiredText = (label: string) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`);

const dateField = z
  .string({ error: "Date is required" })
  .trim()
  .refine(
    (v) => /^\d{4}-\d{2}-\d{2}/.test(v) && !Number.isNaN(Date.parse(v)),
    "Date must be a valid date-time (e.g. 2026-12-10T10:00:00.000Z)"
  );

const totalSeatsField = z
  .number({ error: "Total seats must be a number" })
  .int("Total seats must be an integer")
  .min(1, "Total seats must be greater than 0")
  .max(2147483647, "Total seats is too large");

const priceField = z
  .number({ error: "Price must be a number" })
  .min(0, "Price must be 0 or greater")
  .max(99999999.99, "Price is too large")
  .refine(
    (v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-8,
    "Price can have at most 2 decimal places"
  );

export const createEventSchema = z.object({
  title: requiredText("Title"),
  description: requiredText("Description"),
  category: requiredText("Category"),
  date: dateField,
  location: requiredText("Location"),
  total_seats: totalSeatsField,
  price: priceField,
});

export const updateEventSchema = z
  .object({
    title: requiredText("Title"),
    description: requiredText("Description"),
    category: requiredText("Category"),
    date: dateField,
    location: requiredText("Location"),
    total_seats: totalSeatsField,
    price: priceField,
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update",
  });

export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, "Invalid id")
    .refine((v) => Number(v) <= 2147483647, "Invalid id"),
});

export const listEventsQuerySchema = z.object({
  search: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;