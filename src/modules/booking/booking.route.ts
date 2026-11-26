import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import { bookingController } from "./booking.controller";
import { bookingIdParamSchema, createBookingSchema } from "./booking.schema";

const router = Router();

router.post(
  "/",
  authenticate,
  validate({ body: createBookingSchema }),
  bookingController.create
);

router.get("/", authenticate, bookingController.getMine);

router.patch(
  "/:id/cancel",
  authenticate,
  validate({ params: bookingIdParamSchema }),
  bookingController.cancel
);

export default router;