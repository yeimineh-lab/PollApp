import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "../middleware/errors.mjs";
import {
  getVoteByPollAndUser,
  getVoteByPollAndGuest,
  createVote,
  createGuestVote,
} from "../storage/votes.pgStore.mjs";
import { getPollById } from "../storage/polls.pgStore.mjs";

export async function voteOnPoll({ pollId, userId = null, guestId = null, optionIndex }) {
  if (!Number.isInteger(pollId) || pollId <= 0) {
    throw new ValidationError("Invalid poll id");
  }

  if (!Number.isInteger(optionIndex) || optionIndex < 0) {
    throw new ValidationError("Invalid option index");
  }

  const hasUser = typeof userId === "string" && userId.trim().length > 0;
  const hasGuest = typeof guestId === "string" && guestId.trim().length > 0;

  if (!hasUser && !hasGuest) {
    throw new ValidationError("A user id or guest id is required");
  }

  const poll = await getPollById(pollId);

  if (!poll) {
    throw new NotFoundError("Poll not found");
  }

  const options = String(poll.description ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  if (optionIndex >= options.length) {
    throw new ValidationError("Invalid option index");
  }

  if (!poll.is_public && !hasUser) {
    throw new ForbiddenError("Guests can only vote on public polls");
  }

  if (hasUser && String(poll.owner_id) === String(userId)) {
    throw new ConflictError("You cannot vote on your own poll");
  }

  if (hasUser) {
    const existingVote = await getVoteByPollAndUser(pollId, userId);

    if (existingVote) {
      throw new ConflictError("You have already voted on this poll");
    }

    return createVote(pollId, userId, optionIndex);
  }

  const existingGuestVote = await getVoteByPollAndGuest(pollId, guestId);

  if (existingGuestVote) {
    throw new ConflictError("This browser has already voted on this poll");
  }

  return createGuestVote(pollId, guestId, optionIndex);
}