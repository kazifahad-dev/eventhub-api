import express from "express";

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ success: true, message: "EventHive API is running", data: null });
});

export default app;