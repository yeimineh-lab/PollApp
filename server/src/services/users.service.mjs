/**
 * User service.
 *
 * Handles listing users, creating users,
 * updating the current user, and deleting the current user.
 * Validates input, hashes passwords, and stores consent data.
 */

import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import { deleteSession } from "../services/sessions.service.mjs";
import { ValidationError, ConflictError, NotFoundError } from "../middleware/errors.mjs";
import { normalizeUsername } from "../utils/userUtils.mjs";

import {
  getUserByUsername,
  getUserById,
  insertUser,
  updateUser,
  deleteUserById,
  listUsers,
} from "../storage/users.pgStore.mjs";

// Return a safe overview of all registered users
export async function getUsers() {
  const users = await listUsers();

  return users.map((user) => ({
    id: user.id,
    username: user.username,
    createdAt: user.created_at,
    consent: user.consent,
  }));
}

// Create a new user with validation, password hashing, and consent tracking
export async function createUser(input) {
  const username = normalizeUsername(input?.username);
  const password = String(input?.password || "");
  const tosAccepted = Boolean(input?.tosAccepted);

  if (!username || username.length < 3) {
    throw new ValidationError("Username must be at least 3 characters.");
  }

  if (!password || password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters.");
  }

  if (!tosAccepted) {
    throw new ValidationError("You must accept the Terms of Service.");
  }

  const existing = await getUserByUsername(username);
  if (existing) {
    throw new ConflictError("Username already exists.");
  }

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(password, 12);

  const userId = crypto.randomUUID();
  const consent = {
    tosAcceptedAt: now,
    tosVersion: "v1",
    privacyAcceptedAt: now,
    privacyVersion: "v1",
  };

  const created = await insertUser({
    id: userId,
    username,
    passwordHash,
    createdAt: now,
    consent,
  });

  // The created object contains safe fields only
  return created;
}

// Delete the authenticated user
export async function deleteMe({ userId, token }) {
  await deleteUserById(userId);
  deleteSession(token);

  return { ok: true };
}

// Update the authenticated user's username and/or password
export async function updateMe({ userId, body }) {
  const patchUsernameRaw = body?.username;
  const patchPasswordRaw = body?.password;

  const patchUsername =
    patchUsernameRaw != null ? normalizeUsername(patchUsernameRaw) : null;
  const patchPassword =
    patchPasswordRaw != null ? String(patchPasswordRaw) : null;

  if (patchUsername !== null && patchUsername.length > 0 && patchUsername.length < 3) {
    throw new ValidationError("Username must be at least 3 characters.");
  }

  if (patchPassword !== null && patchPassword.length > 0 && patchPassword.length < 8) {
    throw new ValidationError("Password must be at least 8 characters.");
  }

  const user = await getUserById(userId);
  if (!user) throw new NotFoundError("User not found");

  const oldUsername = user.username;

  // If username changes, it must still be unique
  if (patchUsername && patchUsername !== oldUsername) {
    const taken = await getUserByUsername(patchUsername);
    if (taken && taken.id !== userId) {
      throw new ConflictError("Username already exists.");
    }
  }

  // Hash a new password only when one is provided
  const newPasswordHash = patchPassword ? await bcrypt.hash(patchPassword, 12) : null;

  const updatedUser = await updateUser({
    id: userId,
    username: patchUsername && patchUsername !== oldUsername ? patchUsername : null,
    passwordHash: newPasswordHash,
  });

  if (!updatedUser) throw new NotFoundError("User not found");

  return updatedUser;
}