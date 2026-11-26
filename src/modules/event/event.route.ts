import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { eventController } from "./event.controller";
import {
  createEventSchema,
  idParamSchema,
  listEventsQuerySchema,
  updateEventSchema,
} from "./event.schema";

const router = Router();

router.get("/", validate({ query: listEventsQuerySchema }), eventController.getAll);

router.get("/:id", validate({ params: idParamSchema }), eventController.getById);

router.post(
  "/",
  authenticate,
  authorize("organizer"),
  validate({ body: createEventSchema }),
  eventController.create
);

router.patch(
  "/:id",
  authenticate,
  authorize("organizer"),
  validate({ params: idParamSchema, body: updateEventSchema }),
  eventController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("organizer"),
  validate({ params: idParamSchema }),
  eventController.remove
);

export default router;