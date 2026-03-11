import express from "express";
import { requireAuth } from "../middleware/requireAuth.mjs";
import * as usersService from "../services/users.service.mjs";

const router = express.Router();

// GET /api/v1/users
// Returns a list of registered users (requires authentication)
router.get("/users", requireAuth(), async (req, res, next) => {
  try {
    const users = await usersService.getUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/users
// Create a new user
router.post("/users", async (req, res, next) => {
  try {
    const user = await usersService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/users/me
// Update the authenticated user's profile
router.patch("/users/me", requireAuth(), async (req, res, next) => {
  try {
    const result = await usersService.updateMe({
      userId: req.auth.userId,
      body: req.body,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/users/me
// Delete the authenticated user account
router.delete("/users/me", requireAuth(), async (req, res, next) => {
  try {
    const result = await usersService.deleteMe({
      userId: req.auth.userId,
      token: req.auth.token,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;