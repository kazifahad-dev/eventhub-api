import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/auth.route";
import eventRoutes from "./modules/event/event.route";
import bookingRoutes from "./modules/booking/booking.route";

const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/bookings", bookingRoutes);

app.get("/", (_req, res) => {
  res.json({ success: true, message: "EventHive API is running", data: null });
});



app.use(notFoundHandler);
app.use(errorHandler);
// app.use("/api/v1/auth", authRoutes);

export default app;