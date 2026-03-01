import { pool } from "./db.mjs";

export async function getUserByUsername(username) {
  const r = await pool.query(
    `SELECT id, username, password_hash, created_at, consent
     FROM users
     WHERE username = $1`,
    [username]
  );
  return r.rows[0] ?? null;
}

export async function getUserById(id) {
  const r = await pool.query(
    `SELECT id, username, password_hash, created_at, consent
     FROM users
     WHERE id = $1`,
    [id]
  );
  return r.rows[0] ?? null;
}

export async function insertUser({ id, username, passwordHash, createdAt, consent }) {
  const r = await pool.query(
    `INSERT INTO users (id, username, password_hash, created_at, consent)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, username, created_at, consent`,
    [id, username, passwordHash, createdAt, consent]
  );
  return r.rows[0];
}

export async function updateUser({ id, username, passwordHash }) {
  const r = await pool.query(
    `UPDATE users
     SET username = COALESCE($2, username),
         password_hash = COALESCE($3, password_hash)
     WHERE id = $1
     RETURNING id, username, created_at, consent`,
    [id, username ?? null, passwordHash ?? null]
  );
  return r.rows[0] ?? null;
}

export async function deleteUserById(id) {
  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
}