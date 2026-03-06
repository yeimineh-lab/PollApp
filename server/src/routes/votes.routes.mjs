// votes.routes.mjs
// Defines API endpoints for creating or updating a user's vote on a poll.

import express from "express";
import { requireAuth } from "../middleware/requireAuth.mjs";
import { voteOnPoll } from "../services/votes.service.mjs";

const router = express.Router();

// Create or update a vote for a poll
router.post("/polls/:id/vote", requireAuth(), async (req, res, next) => {
  try {
    const pollId = Number(req.params.id);
    const userId = req.auth.userId;
    const optionIndex = Number(req.body.optionIndex);

    const vote = await voteOnPoll({ pollId, userId, optionIndex });
    res.status(200).json(vote);
  } catch (error) {
    next(error);
  }
});

export default router;