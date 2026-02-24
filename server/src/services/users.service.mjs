import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createJsonStore } from "../storage/jsonStore.mjs";
import { deleteSession } from "../auth/sessions.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFile = path.join(__dirname, "..", "..", "data", "users.json");
const pollsFile = path.join(__dirname, "..", "..", "data", "polls.json");

const usersStore = createJsonStore(usersFile, []);
const pollsStore = createJsonStore(pollsFile, []);

function normalizeUsername(u) {
  return String(u || "").trim().toLowerCase();
}

export async function createUser(input) {
  const username = normalizeUsername(input.username);
  const password = String(input.password || "");
  const tosAccepted = Boolean(input.tosAccepted);

  if (!username || username.length < 3)
    throw Object.assign(new Error("Username must be at least 3 characters."), { status: 400 });

  if (!password || password.length < 8)
    throw Object.assign(new Error("Password must be at least 8 characters."), { status: 400 });

  if (!tosAccepted)
    throw Object.assign(new Error("You must accept the Terms of Service."), { status: 400 });

  const users = await usersStore.read();

  if (users.some((u) => u.username === username))
    throw Object.assign(new Error("Username already exists."), { status: 409 });

  const now = new Date().toISOString();
  const passwordHash = await bcrypt.hash(password, 12);

  const user = {
    id: crypto.randomUUID(),
    username,
    passwordHash,
    createdAt: now,
    consent: {
      tosAcceptedAt: now,
      tosVersion: "v1",
      privacyAcceptedAt: now,
      privacyVersion: "v1",
    },
  };

  users.push(user);
  await usersStore.write(users);

  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    consent: user.consent,
  };
}

export async function deleteMe({ userId, token }) {
  const users = await usersStore.read();
  const remaining = users.filter((u) => u.id !== userId);

  await usersStore.write(remaining);

  const polls = await pollsStore.read();
  const updated = polls.map((p) =>
    p.ownerId === userId
      ? { ...p, ownerId: null, ownerUsername: "deleted-user" }
      : p
  );

  await pollsStore.write(updated);

  deleteSession(token);

  return { ok: true };
}