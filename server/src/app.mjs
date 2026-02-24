import express from "express";

import pollsRoutes from "./routes/polls.routes.mjs";
import usersRoutes from "./routes/users.routes.mjs";
import authRoutes from "./routes/auth.routes.mjs";

import notFound from "./middleware/notFound.mjs";
import errorHandler from "./middleware/errorHandler.mjs";
import { PUBLIC_DIR } from "./config/paths.mjs";

const app = express();

app.use(express.json());
app.use(express.static(PUBLIC_DIR));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/v1", pollsRoutes);
app.use("/api/v1", usersRoutes);
app.use("/api/v1", authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;