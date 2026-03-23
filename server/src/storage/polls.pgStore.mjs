import { pool } from "./db.mjs";

export async function getPollById(id) {
  const result = await pool.query(
    `SELECT
        p.id,
        p.owner_id,
        p.title,
        p.description,
        p.created_at,
        p.is_public,
        u.username AS owner_username
     FROM polls p
     LEFT JOIN users u ON u.id = p.owner_id
     WHERE p.id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function insertPoll({
  ownerId,
  title,
  description = "",
  isPublic = false,
}) {
  const result = await pool.query(
    `INSERT INTO polls (owner_id, title, description, is_public)
     VALUES ($1, $2, $3, $4)
     RETURNING id, owner_id, title, description, is_public, created_at`,
    [ownerId, title, description, isPublic],
  );

  return result.rows[0];
}

export async function listPollRows() {
  const result = await pool.query(
    `SELECT
        p.id,
        p.owner_id,
        p.title,
        p.description,
        p.created_at,
        p.is_public,
        u.username AS owner_username
     FROM polls p
     LEFT JOIN users u ON u.id = p.owner_id
     ORDER BY p.created_at DESC`,
  );

  return result.rows;
}

export async function listVisiblePollRows({ userId = null } = {}) {
  if (!userId) {
    const result = await pool.query(
      `SELECT
          p.id,
          p.owner_id,
          p.title,
          p.description,
          p.created_at,
          p.is_public,
          u.username AS owner_username
       FROM polls p
       LEFT JOIN users u ON u.id = p.owner_id
       WHERE p.is_public = true
       ORDER BY p.created_at DESC`,
    );

    return result.rows;
  }

  const result = await pool.query(
    `SELECT
        p.id,
        p.owner_id,
        p.title,
        p.description,
        p.created_at,
        p.is_public,
        u.username AS owner_username
     FROM polls p
     LEFT JOIN users u ON u.id = p.owner_id
     WHERE p.is_public = true
        OR p.owner_id = $1
     ORDER BY p.created_at DESC`,
    [userId],
  );

  return result.rows;
}

export async function deletePollById(id) {
  await pool.query(
    `DELETE FROM votes
     WHERE poll_id = $1`,
    [id],
  );

  await pool.query(
    `DELETE FROM polls
     WHERE id = $1`,
    [id],
  );
}