import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import { createSession, deleteSession } from "../services/sessions.service.mjs";
import { AuthError, NotFoundError } from "../middleware/errors.mjs";
import { normalizeUsername } from "../utils/userUtils.mjs";
import { getUserByUsername, getUserById } from "../storage/users.pgStore.mjs";

// Log in a user and create a session token
export async function login({ username, password }) {
  const u = normalizeUsername(username);
  const p = String(password || "");

  const user = await getUserByUsername(u);

  // Do not reveal whether the user exists
  if (!user) {
    throw new AuthError("Invalid credentials");
  }

  // Compare the provided password with the stored password hash
  const ok = await bcrypt.compare(p, user.password_hash);
  if (!ok) {
    throw new AuthError("Invalid credentials");
  }

  // Create a new session token for the authenticated user
  const token = crypto.randomBytes(32).toString("hex");
  await createSession(token, user.id);

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  };
}

// Return the currently authenticated user's public profile
export async function me({ userId }) {
  const user = await getUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return {
    id: user.id,
    username: user.username,
    createdAt: user.created_at,
    consent: user.consent,
  };
}

// Log out the current user by deleting the session token
export async function logout({ token }) {
  await deleteSession(token);
  return { ok: true };
}