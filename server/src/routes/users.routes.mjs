import express from "express";
import { requireAuth } from "../auth/requireAuth.mjs";
import * as usersService from "../services/users.service.mjs";

const router = express.Router();

// POST /api/v1/users
router.post("/users", async (req, res, next) => {
  try {
    const result = await usersService.createUser(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/users/me
router.delete("/users/me", requireAuth(), async (req, res, next) => {
  try {
    const result = await usersService.deleteMe({
      userId: req.auth.userId,
      token: req.auth.token,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;