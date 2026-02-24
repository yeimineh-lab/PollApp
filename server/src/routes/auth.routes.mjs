import express from "express";
import { requireAuth } from "../auth/requireAuth.mjs";
import * as authService from "../services/auth.service.mjs";

const router = express.Router();

router.post("/auth/login", async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get("/auth/me", requireAuth(), async (req, res, next) => {
  try {
    const result = await authService.me({ userId: req.auth.userId });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/auth/logout", requireAuth(), async (req, res, next) => {
  try {
    const result = await authService.logout({ token: req.auth.token });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;