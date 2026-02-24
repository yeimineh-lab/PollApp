import express from "express";
import { requireAuth } from "../auth/requireAuth.mjs";
import * as pollsService from "../services/polls.service.mjs";

const router = express.Router();

// GET /api/v1/polls
router.get("/polls", async (req, res, next) => {
  try {
    const result = await pollsService.listPolls();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/polls
router.post("/polls", requireAuth(), async (req, res, next) => {
  try {
    const result = await pollsService.createPoll({
      body: req.body,
      userId: req.auth.userId,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

export default router;