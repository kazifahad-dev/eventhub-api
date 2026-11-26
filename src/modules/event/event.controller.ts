import { RequestHandler } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { eventService } from "./event.service";

type Handlers = "create" | "getAll" | "getById" | "update" | "remove";

export const eventController: Record<Handlers, RequestHandler> = {
  async create(req, res) {
    const event = await eventService.create(req.body, req.user!.id);
    sendResponse(res, 201, "Event created successfully", event);
  },

  async getAll(req, res) {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;
    const events = await eventService.getAll(search);
    sendResponse(res, 200, "Events retrieved successfully", events);
  },

  async getById(req, res) {
    const event = await eventService.getById(Number(req.params.id));
    sendResponse(res, 200, "Event retrieved successfully", event);
  },

  async update(req, res) {
    const event = await eventService.update(
      Number(req.params.id),
      req.user!.id,
      req.body
    );
    sendResponse(res, 200, "Event updated successfully", event);
  },

  async remove(req, res) {
    await eventService.remove(Number(req.params.id), req.user!.id);
    sendResponse(res, 200, "Event deleted successfully", null);
  },
};