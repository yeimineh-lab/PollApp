import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createJsonStore } from "../storage/jsonStore.mjs";
import { deleteSession } from "../auth/sessions.mjs";
import { ValidationError, ConflictError, NotFoundError } from "../domain/errors.mjs";

import {
  getUserByUsername,
  getUserById,
  insertUser,
  updateUser,
  deleteUserById,
} from "../storage/users.pgStore.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Behold polls i JSON (ingen DB-migrering for polls i denne oppgaven)
const pollsFile = path.join(__dirname, "..", "..", "data", "polls.json");
const pollsStore = createJsonStore(pollsFile, []);

function normalizeUsername(u) {
  return String(u || "").trim().toLowerCase();
}

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

  // created inneholder trygge felt (ikke passord-hash)
  return created;
}

export async function deleteMe({ userId, token }) {
  // Slett bruker fra Postgres
  await deleteUserById(userId);

  // Oppdater polls i JSON slik du allerede gjør
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

  // Bytte username (må være unik)
  if (patchUsername && patchUsername !== oldUsername) {
    const taken = await getUserByUsername(patchUsername);
    if (taken && taken.id !== userId) {
      throw new ConflictError("Username already exists.");
    }
  }

  // Bytte passord
  const newPasswordHash = patchPassword ? await bcrypt.hash(patchPassword, 12) : null;

  const updatedUser = await updateUser({
    id: userId,
    username: patchUsername && patchUsername !== oldUsername ? patchUsername : null,
    passwordHash: newPasswordHash,
  });

  if (!updatedUser) throw new NotFoundError("User not found");

  // Hvis username endret, oppdater polls som eies av brukeren
  if (updatedUser.username !== oldUsername) {
    const polls = await pollsStore.read();
    const updatedPolls = polls.map((p) =>
      p.ownerId === userId ? { ...p, ownerUsername: updatedUser.username } : p
    );
    await pollsStore.write(updatedPolls);
  }

  return updatedUser;
}