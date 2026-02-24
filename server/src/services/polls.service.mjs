import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createJsonStore } from "../storage/jsonStore.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pollsFile = path.join(__dirname, "..", "..", "data", "polls.json");
const usersFile = path.join(__dirname, "..", "..", "data", "users.json");

const pollsStore = createJsonStore(pollsFile, []);
const usersStore = createJsonStore(usersFile, []);

export async function listPolls() {
  const polls = await pollsStore.read();
  return { polls };
}

export async function createPoll({ body, userId }) {
  const { title, options } = body;

  if (!title || String(title).trim().length < 3)
    throw Object.assign(new Error("Poll title must be at least 3 characters."), { status: 400 });

  if (!Array.isArray(options) || options.length < 2)
    throw Object.assign(new Error("Poll must have at least 2 options."), { status: 400 });

  const normalizedOptions = options
    .map((o) => (typeof o === "string" ? o : o?.text))
    .map((t) => String(t ?? "").trim())
    .filter(Boolean);

  if (normalizedOptions.length < 2)
    throw Object.assign(new Error("Poll must have at least 2 valid options."), { status: 400 });

  const [polls, users] = await Promise.all([
    pollsStore.read(),
    usersStore.read(),
  ]);

  const owner = users.find((u) => u.id === userId);

  const poll = {
    id: crypto.randomUUID(),
    title: String(title).trim(),
    options: normalizedOptions.map((text) => ({
      id: crypto.randomUUID(),
      text,
      votes: 0,
    })),
    createdAt: new Date().toISOString(),
    ownerId: userId,
    ownerUsername: owner?.username ?? "unknown",
  };

  polls.push(poll);
  await pollsStore.write(polls);

  return { poll };
}