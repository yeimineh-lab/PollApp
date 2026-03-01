import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import { createSession, deleteSession } from "../auth/sessions.mjs";
import { AuthError, NotFoundError } from "../domain/errors.mjs";

import { getUserByUsername, getUserById } from "../storage/users.pgStore.mjs";

function normalizeUsername(u) {
  return String(u || "").trim().toLowerCase();
}

export async function login({ username, password }) {
  const u = normalizeUsername(username);
  const p = String(password || "");

  const user = await getUserByUsername(u);

  // Do not reveal whether user exists
  if (!user) {
    throw new AuthError("Invalid credentials");
  }

  // Postgres felt: password_hash
  const ok = await bcrypt.compare(p, user.password_hash);
  if (!ok) {
    throw new AuthError("Invalid credentials");
  }

  const token = crypto.randomBytes(32).toString("hex");
  createSession(token, user.id);

  return { token, user: { id: user.id, username: user.username } };
}

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

export async function logout({ token }) {
  deleteSession(token);
  return { ok: true };
}