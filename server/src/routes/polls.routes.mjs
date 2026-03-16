import express from "express";
import { requireAuth } from "../middleware/requireAuth.mjs";
import * as pollsService from "../services/polls.service.mjs";

const router = express.Router();

// GET /api/v1/polls
router.get("/polls", requireAuth(), async (req, res, next) => {
  try {
    const result = await pollsService.listPolls();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/polls/:id/results
router.get("/polls/:id/results", requireAuth(), async (req, res, next) => {
  try {
    const result = await pollsService.getPollResults({
      pollId: req.params.id,
      userId: req.auth.userId,
    });
    res.json(result);
  } catch (error) {
    next(error);
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
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/polls/:id
router.delete("/polls/:id", requireAuth(), async (req, res, next) => {
  try {
    const result = await pollsService.deletePoll({
      pollId: req.params.id,
      userId: req.auth.userId,
    });

    res.json({ ok: true, poll: result });
  } catch (error) {
    next(error);
  }
});

export default router;