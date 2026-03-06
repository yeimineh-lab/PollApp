// votes.service.mjs
// Contains business logic for creating or updating votes.

import { ValidationError, NotFoundError } from "../middleware/errors.mjs";
import { getVoteByPollAndUser, createVote, updateVote } from "../storage/votes.pgStore.mjs";
import { getPollById } from "../storage/polls.pgStore.mjs";

export async function voteOnPoll({ pollId, userId, optionIndex }) {
  if (!Number.isInteger(pollId) || pollId <= 0) {
    throw new ValidationError("Invalid poll id");
  }

  if (typeof userId !== "string" || userId.length === 0) {
    throw new ValidationError("Invalid user id");
  }

  if (!Number.isInteger(optionIndex) || optionIndex < 0) {
    throw new ValidationError("Invalid option index");
  }

  const poll = await getPollById(pollId);
  if (!poll) {
    throw new NotFoundError("Poll not found");
  }

  const existingVote = await getVoteByPollAndUser(pollId, userId);

  if (existingVote) {
    return updateVote(pollId, userId, optionIndex);
  }

  return createVote(pollId, userId, optionIndex);
}