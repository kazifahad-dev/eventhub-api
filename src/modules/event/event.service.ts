import { withTransaction } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { eventRepository, EventChanges } from "./event.repository";
import { CreateEventInput, UpdateEventInput } from "./event.schema";

export const eventService = {
  async create(input: CreateEventInput, organizerId: number) {
    return eventRepository.create(input, organizerId);
  },

  async getAll(search?: string) {
    const term = search?.trim();
    
    const pattern = term ? `%${term.replace(/[\\%_]/g, "\\$&")}%` : null;
    return eventRepository.findAll(pattern);
  },

  async getById(id: number) {
    const event = await eventRepository.findByIdWithOrganizer(id);
    if (!event) {
      throw new AppError(404, "Event not found");
    }
    return event;
  },

  async update(id: number, userId: number, input: UpdateEventInput) {
    return withTransaction(async (client) => {
      const event = await eventRepository.findByIdForUpdate(id, client);

      
      if (!event) {
        throw new AppError(404, "Event not found");
      }
      if (event.organizer_id !== userId) {
        throw new AppError(403, "You can only update your own events");
      }

      const changes: EventChanges = { ...input };

      if (input.total_seats !== undefined) {
        const sold = await eventRepository.sumConfirmedTickets(id, client);
        const available = input.total_seats - sold;

        if (available < 0) {
          throw new AppError(
            400,
            "Total seats cannot be less than the tickets already sold"
          );
        }
        changes.available_seats = available;
      }

      return eventRepository.update(id, changes, client);
    });
  },

  async remove(id: number, userId: number) {
    await withTransaction(async (client) => {
      const event = await eventRepository.findByIdForUpdate(id, client);

      if (!event) {
        throw new AppError(404, "Event not found");
      }
      if (event.organizer_id !== userId) {
        throw new AppError(403, "You can only delete your own events");
      }

      const hasConfirmed = await eventRepository.hasConfirmedBookings(
        id,
        client
      );
      if (hasConfirmed) {
        throw new AppError(
          400,
          "Cannot delete an event that has confirmed bookings"
        );
      }

      await eventRepository.deleteById(id, client);
    });
  },
};