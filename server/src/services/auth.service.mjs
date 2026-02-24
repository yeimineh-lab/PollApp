import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createJsonStore } from "../storage/jsonStore.mjs";
import { createSession, deleteSession } from "../auth/sessions.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// __dirname = server/src/services
const usersFile = path.join(__dirname, "..", "..", "data", "users.json");
const usersStore = createJsonStore(usersFile, []);

function normalizeUsername(u) {
  return String(u || "").trim().toLowerCase();
}

export async function login({ username, password }) {
  const u = normalizeUsername(username);
  const p = String(password || "");

  const users = await usersStore.read();
  const user = users.find((x) => x.username === u);
  if (!user) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(p, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.status = 401;
    throw err;
  }

  const token = crypto.randomBytes(32).toString("hex");
  createSession(token, user.id);

  return { token, user: { id: user.id, username: user.username } };
}

export async function me({ userId }) {
  const users = await usersStore.read();
  const user = users.find((x) => x.id === userId);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    consent: user.consent,
  };
}

export async function logout({ token }) {
  deleteSession(token);
  return { ok: true };
}