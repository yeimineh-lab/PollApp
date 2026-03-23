import { pool } from "./db.mjs";

export async function getVoteByPollAndUser(pollId, userId) {
  const result = await pool.query(
    `SELECT id, poll_id, user_id, guest_id, option_index, created_at
     FROM votes
     WHERE poll_id = $1 AND user_id = $2
     LIMIT 1`,
    [pollId, userId],
  );

  return result.rows[0] ?? null;
}

export async function getVoteByPollAndGuest(pollId, guestId) {
  const result = await pool.query(
    `SELECT id, poll_id, user_id, guest_id, option_index, created_at
     FROM votes
     WHERE poll_id = $1 AND guest_id = $2
     LIMIT 1`,
    [pollId, guestId],
  );

  return result.rows[0] ?? null;
}

export async function createVote(pollId, userId, optionIndex) {
  const result = await pool.query(
    `INSERT INTO votes (poll_id, user_id, guest_id, option_index)
     VALUES ($1, $2, NULL, $3)
     RETURNING id, poll_id, user_id, guest_id, option_index, created_at`,
    [pollId, userId, optionIndex],
  );

  return result.rows[0];
}

export async function createGuestVote(pollId, guestId, optionIndex) {
  const result = await pool.query(
    `INSERT INTO votes (poll_id, user_id, guest_id, option_index)
     VALUES ($1, NULL, $2, $3)
     RETURNING id, poll_id, user_id, guest_id, option_index, created_at`,
    [pollId, guestId, optionIndex],
  );

  return result.rows[0];
}