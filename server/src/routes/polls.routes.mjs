import express from "express";
import { optionalAuth } from "../middleware/optionalAuth.mjs";
import * as pollsService from "../services/polls.service.mjs";

const router = express.Router();

// GET /api/v1/polls
router.get("/polls", optionalAuth(), async (req, res, next) => {
  try {
    const result = await pollsService.listPolls({
      userId: req.auth?.userId ?? null,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/polls/:id/results
router.get("/polls/:id/results", optionalAuth(), async (req, res, next) => {
  try {
    const result = await pollsService.getPollResults({
      pollId: req.params.id,
      userId: req.auth?.userId ?? null,
      guestId: req.query.guestId ? String(req.query.guestId) : null,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/polls
router.post("/polls", optionalAuth(), async (req, res, next) => {
  try {
    const result = await pollsService.createPoll({
      body: req.body,
      userId: req.auth?.userId ?? null,
      guestId: req.body.guestId ? String(req.body.guestId) : null,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/polls/:id
router.delete("/polls/:id", optionalAuth(), async (req, res, next) => {
  try {
    const result = await pollsService.deletePoll({
      pollId: req.params.id,
      userId: req.auth?.userId ?? null,
      guestId: req.query.guestId ? String(req.query.guestId) : null,
    });

    res.json({ ok: true, poll: result });
  } catch (error) {
    next(error);
  }
});

export default router;