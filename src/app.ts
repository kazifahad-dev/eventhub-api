import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ success: true, message: "EventHive API is running", data: null });
});



app.use(notFoundHandler);
app.use(errorHandler);

export default app;