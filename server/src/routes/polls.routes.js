const express = require("express");
const crypto = require("crypto");
const path = require("path");
const { createJsonStore } = require("../storage/jsonStore");
const { requireAuth } = require("../auth/requireAuth");

const router = express.Router();

const pollsFile = path.join(__dirname, "..", "..", "data", "polls.json");
const usersFile = path.join(__dirname, "..", "..", "data", "users.json");

const pollsStore = createJsonStore(pollsFile, []);
const usersStore = createJsonStore(usersFile, []);

// GET /api/v1/polls
router.get("/polls", async (req, res) => {
  const polls = await pollsStore.read();
  res.json({ polls });
});

// POST /api/v1/polls (requires login)
router.post("/polls", requireAuth(), async (req, res) => {
  const { title, options } = req.body;

  if (!title || String(title).trim().length < 3) {
    return res.status(400).json({ error: "Poll title must be at least 3 characters." });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: "Poll must have at least 2 options." });
  }

  const normalizedOptions = options
    .map((o) => (typeof o === "string" ? o : o?.text))
    .map((t) => String(t ?? "").trim())
    .filter(Boolean);

  if (normalizedOptions.length < 2) {
    return res.status(400).json({ error: "Poll must have at least 2 valid options." });
  }

  const [polls, users] = await Promise.all([pollsStore.read(), usersStore.read()]);
  const owner = users.find((u) => u.id === req.auth.userId);

  const poll = {
    id: crypto.randomUUID(),
    title: String(title).trim(),
    options: normalizedOptions.map((text) => ({
      id: crypto.randomUUID(),
      text,
      votes: 0,
    })),
    createdAt: new Date().toISOString(),
    ownerId: req.auth.userId,
    ownerUsername: owner?.username ?? "unknown",
  };

  polls.push(poll);
  await pollsStore.write(polls);

  res.status(201).json({ poll });
});

module.exports = router;
