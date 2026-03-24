/**
 * Poll routes.
 *
 * Handles listing polls, creating polls,
 * retrieving poll results, and deleting polls.
 */

import express from "express";
import * as pollsService from "../services/polls.service.mjs";
import { optionalAuth } from "../middleware/optionalAuth.mjs";

const router = express.Router();

// GET /api/v1/polls
router.get("/polls", optionalAuth(), async (req, res, next) => {
  try {
    const result = await pollsService.listPolls({
      userId: req.auth?.userId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/polls/:id/results
router.get("/polls/:id/results", optionalAuth(), async (req, res, next) => {
  try {
    const result = await pollsService.getPollResults({
      pollId: req.params.id,
      userId: req.auth?.userId,
      guestId: req.query.guestId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/polls
router.post("/polls", optionalAuth(), async (req, res, next) => {
  try {
    const result = await pollsService.createPoll({
      body: req.body,
      userId: req.auth?.userId,
      guestId: req.body.guestId,
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/polls/:id
router.delete("/polls/:id", optionalAuth(), async (req, res, next) => {
  try {
    const result = await pollsService.deletePoll({
      pollId: req.params.id,
      userId: req.auth?.userId,
      guestId: req.query.guestId,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;