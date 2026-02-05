const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const path = require("path");

const { createJsonStore } = require("../storage/jsonStore");
const { requireAuth } = require("../auth/requireAuth");
const { deleteSession } = require("../auth/sessions");

const router = express.Router();

const usersFile = path.join(__dirname, "..", "..", "data", "users.json");
const pollsFile = path.join(__dirname, "..", "..", "data", "polls.json");

const usersStore = createJsonStore(usersFile, []);
const pollsStore = createJsonStore(pollsFile, []);

function normalizeUsername(u) {
  return String(u || "").trim().toLowerCase();
}

// POST /api/v1/users
router.post("/users", async (req, res) => {
  const username = normalizeUsername(req.body.username);
  const password = String(req.body.password || "");
  const tosAccepted = Boolean(req.body.tosAccepted);

  if (!username || username.length < 3) {
    return res.status(400).json({ error: "Username must be at least 3 characters." });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }
  if (!tosAccepted) {
    return res.status(400).json({ error: "You must accept the Terms of Service." });
  }

  const users = await usersStore.read();
  if (users.some((u) => u.username === username)) {
    return res.status(409).json({ error: "Username already exists." });
  }

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(password, 12);

  const user = {
    id: crypto.randomUUID(),
    username,
    passwordHash,
    createdAt: now,
    consent: {
      tosAcceptedAt: now,
      tosVersion: "v1",
      privacyAcceptedAt: now,
      privacyVersion: "v1",
    },
  };

  users.push(user);
  await usersStore.write(users);

  res.status(201).json({
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    consent: user.consent,
  });
});

// DELETE /api/v1/users/me
router.delete("/users/me", requireAuth(), async (req, res) => {
  const userId = req.auth.userId;

  const users = await usersStore.read();
  const before = users.length;
  const remaining = users.filter((u) => u.id !== userId);
  const deleted = remaining.length !== before;

  if (deleted) await usersStore.write(remaining);

  const polls = await pollsStore.read();
  let pollsAnonymized = 0;

  const updated = polls.map((p) => {
    if (p && p.ownerId === userId) {
      pollsAnonymized++;
      return { ...p, ownerId: null, ownerUsername: "deleted-user" };
    }
    return p;
  });

  if (pollsAnonymized > 0) await pollsStore.write(updated);

  deleteSession(req.auth.token);

  res.json({ ok: true, deleted, pollsAnonymized });
});

module.exports = router;
