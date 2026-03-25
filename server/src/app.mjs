/**
 * Express application setup.
 *
 * Configures middleware, routes, static files,
 * language handling, and error handling.
 */

import express from "express";

import pollsRoutes from "./routes/polls.routes.mjs";
import usersRoutes from "./routes/users.routes.mjs";
import authRoutes from "./routes/auth.routes.mjs";
import votesRoutes from "./routes/votes.routes.mjs";

import requireJson from "./middleware/requireJson.mjs";
import notFound from "./middleware/notFound.mjs";
import errorHandler from "./middleware/errorHandler.mjs";

import { PUBLIC_DIR } from "./config/paths.mjs";
import { getLanguage, t } from "./i18n/index.mjs";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  const lang = getLanguage(req.headers["accept-language"]);
  req.lang = lang;
  req.t = (key) => t(lang, key);
  next();
});

app.use(requireJson);

app.use(
  express.static(PUBLIC_DIR, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache, must-revalidate");
        return;
      }

      if (
        filePath.endsWith(".mjs") ||
        filePath.endsWith(".js") ||
        filePath.endsWith(".css")
      ) {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  }),
);

// Health check for hosting / monitoring
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Health check under API version
app.get("/api/v1/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/test-error", (req, res, next) => {
  next({ status: 500 });
});

app.use("/api/v1", pollsRoutes);
app.use("/api/v1", usersRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", votesRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;