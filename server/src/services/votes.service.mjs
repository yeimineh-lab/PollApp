import { ValidationError, NotFoundError, ConflictError } from "../middleware/errors.mjs";
import { getVoteByPollAndUser, createVote } from "../storage/votes.pgStore.mjs";
import { getPollById } from "../storage/polls.pgStore.mjs";

export async function voteOnPoll({ pollId, userId, optionIndex }) {
  if (!Number.isInteger(pollId) || pollId <= 0) {
    throw new ValidationError("Invalid poll id");
  }

  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new ValidationError("Invalid user id");
  }

  if (!Number.isInteger(optionIndex) || optionIndex < 0) {
    throw new ValidationError("Invalid option index");
  }

  const poll = await getPollById(pollId);

  if (!poll) {
    throw new NotFoundError("Poll not found");
  }

  if (String(poll.owner_id) === String(userId)) {
    throw new ConflictError("You cannot vote on your own poll");
  }

  const existingVote = await getVoteByPollAndUser(pollId, userId);

  if (existingVote) {
    throw new ConflictError("You have already voted on this poll");
  }

  return createVote(pollId, userId, optionIndex);
}