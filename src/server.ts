import app from "./app";
import { env } from "./config/env";
import { pool } from "./config/db";

async function start() {
  await pool.query("SELECT 1");
  console.log("Database connected");

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});