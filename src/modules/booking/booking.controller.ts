import { RequestHandler } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { bookingService } from "./booking.service";

type Handlers = "create" | "getMine" | "cancel";

export const bookingController: Record<Handlers, RequestHandler> = {
  async create(req, res) {
    const booking = await bookingService.create(req.body, req.user!.id);
    sendResponse(res, 201, "Tickets booked successfully", booking);
  },

  async getMine(req, res) {
    const bookings = await bookingService.getMine(req.user!.id);
    sendResponse(res, 200, "Bookings retrieved successfully", bookings);
  },

  async cancel(req, res) {
    const booking = await bookingService.cancel(
      Number(req.params.id),
      req.user!.id
    );
    sendResponse(res, 200, "Booking cancelled successfully", booking);
  },
};