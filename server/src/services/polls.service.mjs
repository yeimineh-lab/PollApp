import { getUserById } from "../storage/users.pgStore.mjs";
import {
  insertPoll,
  listPollRows,
  getPollById,
  deletePollById,
} from "../storage/polls.pgStore.mjs";
import { getVoteByPollAndUser } from "../storage/votes.pgStore.mjs";
import { ValidationError, NotFoundError } from "../middleware/errors.mjs";
import { pool } from "../storage/db.mjs";

function normalizeTitle(t) {
  return String(t ?? "").trim();
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) return [];

  return options
    .map((o) => (typeof o === "string" ? o : o?.text))
    .map((t) => String(t ?? "").trim())
    .filter(Boolean);
}

export async function listPolls() {
  const polls = await listPollRows();
  return { polls };
}

export async function createPoll({ body, userId }) {
  const title = normalizeTitle(body?.title);
  const normalizedOptions = normalizeOptions(body?.options);

  if (!title || title.length < 3) {
    throw new ValidationError("Poll title must be at least 3 characters.");
  }

  if (normalizedOptions.length < 2) {
    throw new ValidationError("Poll must have at least 2 valid options.");
  }

  const owner = await getUserById(userId);

  if (!owner) {
    throw new NotFoundError("User not found");
  }

  const poll = await insertPoll({
    ownerId: userId,
    title,
    description: normalizedOptions.join(" | "),
  });

  return { poll };
}

export async function getPollResults({ pollId, userId }) {
  const poll = await getPollById(pollId);

  if (!poll) {
    throw new NotFoundError("Poll not found");
  }

  const description = poll.description ?? "";
  const options = description
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const voteResult = await pool.query(
    `SELECT option_index, COUNT(*)::int AS votes
     FROM votes
     WHERE poll_id = $1
     GROUP BY option_index
     ORDER BY option_index`,
    [pollId],
  );

  const counts = new Map(
    voteResult.rows.map((row) => [Number(row.option_index), Number(row.votes)]),
  );

  const existingVote = userId
    ? await getVoteByPollAndUser(pollId, userId)
    : null;

  return {
    poll: {
      id: poll.id,
      title: poll.title,
      createdBy: poll.owner_id,
      ownerUsername: poll.owner_username,
      userVote: existingVote ? Number(existingVote.option_index) : null,
      options: options.map((text, index) => ({
        optionIndex: index,
        text,
        votes: counts.get(index) ?? 0,
      })),
    },
  };
}

export async function deletePoll({ pollId, userId }) {
  const poll = await getPollById(pollId);

  if (!poll) {
    throw new NotFoundError("Poll not found");
  }

  if (String(poll.owner_id) !== String(userId)) {
    throw new ValidationError("You can only delete your own polls.");
  }

  await deletePollById(pollId);

  return {
    id: poll.id,
    title: poll.title,
    createdBy: poll.owner_id,
    ownerUsername: poll.owner_username,
  };
}