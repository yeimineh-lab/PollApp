import express from "express";
import { requireAuth } from "../middleware/requireAuth.mjs";
import { voteOnPoll } from "../services/votes.service.mjs";

const router = express.Router();

router.post("/polls/:id/vote", requireAuth(), async (req, res, next) => {
  try {
    const pollId = Number(req.params.id);
    const userId = String(req.auth.userId);
    const optionIndex = Number(req.body.optionIndex);

    const vote = await voteOnPoll({
      pollId,
      userId,
      optionIndex,
    });

    res.status(201).json(vote);
  } catch (error) {
    next(error);
  }
});

export default router;