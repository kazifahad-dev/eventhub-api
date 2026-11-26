import { withTransaction } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { eventRepository } from "../event/event.repository";
import { bookingRepository } from "./booking.repository";
import { CreateBookingInput } from "./booking.schema";

export const bookingService = {
  async create(input: CreateBookingInput, userId: number) {
    return withTransaction(async (client) => {
      
      const event = await eventRepository.findByIdForUpdate(
        input.event_id,
        client
      );

      if (!event) {
        throw new AppError(404, "Event not found");
      }
      if (event.organizer_id === userId) {
        throw new AppError(
          403,
          "Organizers cannot book tickets for their own events"
        );
      }
      if (event.date.getTime() <= Date.now()) {
        throw new AppError(
          400,
          "Cannot book tickets for an event that has already passed"
        );
      }
      if (event.available_seats < input.tickets_booked) {
        throw new AppError(400, "Insufficient available seats for this event");
      }

      const booking = await bookingRepository.create(
        event.id,
        userId,
        input.tickets_booked,
        event.price,
        client
      );
      await bookingRepository.changeSeats(
        event.id,
        -input.tickets_booked,
        client
      );

      return booking;
    });
  },

  async getMine(userId: number) {
    return bookingRepository.findByUser(userId);
  },

  async cancel(id: number, userId: number) {
    return withTransaction(async (client) => {
      
      const initial = await bookingRepository.findById(id, client);
      if (!initial) {
        throw new AppError(404, "Booking not found");
      }
      if (initial.attendee_id !== userId) {
        throw new AppError(403, "You can only cancel your own bookings");
      }

      
      const event = await eventRepository.findByIdForUpdate(
        initial.event_id,
        client
      );
      const booking = await bookingRepository.findByIdForUpdate(id, client);

      if (!event || !booking) {
        throw new AppError(404, "Booking not found");
      }
      if (booking.status === "cancelled") {
        throw new AppError(409, "Booking is already cancelled");
      }
      if (event.date.getTime() <= Date.now()) {
        throw new AppError(
          400,
          "Cannot cancel a booking after the event has started"
        );
      }

      const cancelled = await bookingRepository.markCancelled(id, client);
      await bookingRepository.changeSeats(
        event.id,
        booking.tickets_booked,
        client
      );

      return cancelled;
    });
  },
};