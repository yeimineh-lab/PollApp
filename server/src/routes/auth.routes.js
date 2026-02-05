const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");

const { createJsonStore } = require("../storage/jsonStore");
const { createSession, deleteSession } = require("../auth/sessions");
const { requireAuth } = require("../auth/requireAuth");

const router = express.Router();

const usersFile = path.join(__dirname, "..", "..", "data", "users.json");
const usersStore = createJsonStore(usersFile, []);

function normalizeUsername(u) {
  return String(u || "").trim().toLowerCase();
}

// POST /api/v1/auth/login
router.post("/auth/login", async (req, res) => {
  const username = normalizeUsername(req.body.username);
  const password = String(req.body.password || "");

  const users = await usersStore.read();
  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = crypto.randomBytes(32).toString("hex");
  createSession(token, user.id);

  res.json({ token, user: { id: user.id, username: user.username } });
});

// GET /api/v1/auth/me
router.get("/auth/me", requireAuth(), async (req, res) => {
  const users = await usersStore.read();
  const user = users.find((u) => u.id === req.auth.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    consent: user.consent,
  });
});

// POST /api/v1/auth/logout
router.post("/auth/logout", requireAuth(), async (req, res) => {
  deleteSession(req.auth.token);
  res.json({ ok: true });
});

module.exports = router;
