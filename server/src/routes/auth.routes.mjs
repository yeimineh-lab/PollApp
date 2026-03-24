/**
 * Authentication routes.
 *
 * Handles login, logout,
 * and retrieving the current user.
 */

import express from "express";
import { requireAuth } from "../middleware/requireAuth.mjs";
import * as authService from "../services/auth.service.mjs";

const router = express.Router();

// POST /api/v1/auth/login
router.post("/auth/login", async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/auth/me
router.get("/auth/me", requireAuth(), async (req, res, next) => {
  try {
    const result = await authService.me({
      userId: req.auth.userId,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/auth/logout
router.post("/auth/logout", requireAuth(), async (req, res, next) => {
  try {
    const result = await authService.logout({
      token: req.auth.token,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;