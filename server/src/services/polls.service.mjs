/**
 * Poll service.
 *
 * Handles listing polls, creating polls,
 * retrieving poll results, and deleting polls.
 * Supports both guests and authenticated users.
 */

import {
  insertPoll,
  listPollRows,
  listVisiblePollRows,
  getPollById,
  deletePollById,
} from "../storage/polls.pgStore.mjs";
import {
  getVoteByPollAndUser,
  getVoteByPollAndGuest,
} from "../storage/votes.pgStore.mjs";
import {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from "../middleware/errors.mjs";
import { pool } from "../storage/db.mjs";

function normalizeTitle(t) {
  return String(t ?? "").trim();
}

function normalizeGuestUsername(value) {
  const username = String(value ?? "").trim();
  return username || "Guest";
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) return [];

  return options
    .map((o) => (typeof o === "string" ? o : o?.text))
    .map((t) => String(t ?? "").trim())
    .filter(Boolean);
}

export async function listPolls({ userId = null } = {}) {
  const polls = userId
    ? await listPollRows()
    : await listVisiblePollRows({ userId: null });

  return { polls };
}

export async function createPoll({ body, userId = null, guestId = null }) {
  const title = normalizeTitle(body?.title);
  const normalizedOptions = normalizeOptions(body?.options);
  const isPublic = Boolean(body?.isPublic);
  const guestUsername = !userId
    ? normalizeGuestUsername(body?.guestUsername)
    : null;

  if (!title || title.length < 3) {
    throw new ValidationError("Poll title must be at least 3 characters.");
  }

  if (normalizedOptions.length < 2) {
    throw new ValidationError("Poll must have at least 2 valid options.");
  }

  if (!userId && (!guestId || guestId.trim().length === 0)) {
    throw new ValidationError("A user or guest id is required to create a poll.");
  }

  const poll = await insertPoll({
    ownerId: userId,
    guestId: userId ? null : guestId,
    guestUsername,
    title,
    description: normalizedOptions.join(" | "),
    isPublic,
  });

  return {
    poll: {
      ...poll,
      guestId: userId ? null : guestId,
      guestUsername,
    },
  };
}

export async function getPollResults({ pollId, userId = null, guestId = null }) {
  const poll = await getPollById(pollId);

  if (!poll) {
    throw new NotFoundError("Poll not found");
  }

  const canAccess = Boolean(poll.is_public) || Boolean(userId);

  if (!canAccess) {
    throw new ForbiddenError("You do not have access to this poll.");
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
    : guestId
      ? await getVoteByPollAndGuest(pollId, guestId)
      : null;

  return {
    poll: {
      id: poll.id,
      title: poll.title,
      isPublic: Boolean(poll.is_public),
      createdBy: poll.owner_id,
      guestId: poll.guest_id,
      guestUsername: poll.guest_username,
      ownerUsername: poll.owner_username ?? poll.guest_username ?? "Guest",
      userVote: existingVote ? Number(existingVote.option_index) : null,
      options: options.map((text, index) => ({
        optionIndex: index,
        text,
        votes: counts.get(index) ?? 0,
      })),
    },
  };
}

export async function deletePoll({ pollId, userId = null, guestId = null }) {
  const poll = await getPollById(pollId);

  if (!poll) {
    throw new NotFoundError("Poll not found");
  }

  const isUserOwner =
    userId && poll.owner_id && String(poll.owner_id) === String(userId);

  const isGuestOwner =
    guestId && poll.guest_id && String(poll.guest_id) === String(guestId);

  if (!isUserOwner && !isGuestOwner) {
    throw new ValidationError("You can only delete your own polls.");
  }

  await deletePollById(pollId);

  return {
    id: poll.id,
    title: poll.title,
    createdBy: poll.owner_id,
    guestId: poll.guest_id,
    ownerUsername: poll.owner_username ?? poll.guest_username ?? "Guest",
  };
}