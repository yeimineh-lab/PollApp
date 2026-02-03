const express = require("express");
const crypto = require("crypto");
const { createJsonStore } = require("../storage/jsonStore");
const { requireAuth } = require("../auth/requireAuth");

const router = express.Router();
const pollsStore = createJsonStore("./server/data/polls.json", []);

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

  const polls = await pollsStore.read();

  const poll = {
    id: crypto.randomUUID(),
    title: String(title).trim(),
    options: options.map((o) => ({
      id: crypto.randomUUID(),
      text: String(o).trim(),
      votes: 0,
    })),
    createdAt: new Date().toISOString(),

    // ownership (needed for anonymization later)
    ownerId: req.auth.userId,
    ownerUsername: "testuser", // 
  };

  polls.push(poll);
  await pollsStore.write(polls);

  res.status(201).json({ poll });
});

module.exports = router;
