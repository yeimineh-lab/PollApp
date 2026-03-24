/**
 * Vote routes.
 *
 * Handles voting on polls
 * for guests and authenticated users.
 */

import express from "express";
import { optionalAuth } from "../middleware/optionalAuth.mjs";
import { voteOnPoll } from "../services/votes.service.mjs";

const router = express.Router();

// POST /api/v1/polls/:id/vote
router.post("/polls/:id/vote", optionalAuth(), async (req, res, next) => {
  try {
    const pollId = Number(req.params.id);
    const optionIndex = Number(req.body.optionIndex);
    const userId = req.auth?.userId ? String(req.auth.userId) : null;
    const guestId = req.body.guestId ? String(req.body.guestId) : null;

    const vote = await voteOnPoll({
      pollId,
      userId,
      guestId,
      optionIndex,
    });

    res.status(201).json(vote);
  } catch (error) {
    next(error);
  }
});

export default router;