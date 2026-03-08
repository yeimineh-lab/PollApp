// app.mjs
// Sets up the Express app, middleware, static files, API routes, and error handling.

import express from "express";

// API route modules
import pollsRoutes from "./routes/polls.routes.mjs";
import usersRoutes from "./routes/users.routes.mjs";
import authRoutes from "./routes/auth.routes.mjs";
import votesRoutes from "./routes/votes.routes.mjs";

// App middleware
import requireJson from "./middleware/requireJson.mjs";
import notFound from "./middleware/notFound.mjs";
import errorHandler from "./middleware/errorHandler.mjs";

// App config
import { PUBLIC_DIR } from "./config/paths.mjs";

// Language (i18n)
import { getLanguage, t } from "./i18n/index.js";

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Detect browser language
app.use((req, res, next) => {
  const lang = getLanguage(req.headers["accept-language"]);
  req.lang = lang;
  req.t = (key) => t(lang, key);
  next();
});

// Require application/json for non-GET API requests
app.use(requireJson);

// Serve static frontend files
app.use(express.static(PUBLIC_DIR));

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Test route for i18n errors
app.get("/test-error", (req, res, next) => {
  next({ status: 500 });
});

// API routes
app.use("/api/v1", pollsRoutes);
app.use("/api/v1", usersRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", votesRoutes);

// Unknown routes
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;