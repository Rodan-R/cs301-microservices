import express from "express";
import helmet from "helmet";

import pool from "./db/pool.js";
import agentsRouter from "./routes/agents.js"; 
import { requireAuth } from "./middlewares/auth.js";
import 'dotenv/config';

const app = express();
app.use(helmet());
app.use(express.json({ limit: "1mb" }));

app.get("/healthz", (_req, res) => res.send("ok"));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/readyz", async (_req, res) => {
  try { await pool.query("SELECT 1"); res.send("ready"); }
  catch (e) { res.status(503).send("not ready"); console.log(e)}
});

// Root route
app.get("/", (req, res) => res.send("API is running"));



app.use("/:agentID", requireAuth, agentsRouter)

// // Basic error handler
// app.use((err, _req, res, _next) => {
//   console.error(err);
//   res.status(500).json({ error: "InternalServerError" });
// });
app.use((err, _req, res, _next) => {
  console.error(err);

  // Filter from bubbled errors into specific messages
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "ValidationError", details: err.message });
  }

  if (err.code === "23505") { // e.g., PostgreSQL unique violation
    return res.status(409).json({ error: "Conflict", details: "Email already exists" });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(403).json({ error: "Forbidden" });
  }

  res.status(500).json({ error: "InternalServerError" });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Service listening on :${PORT}`));
