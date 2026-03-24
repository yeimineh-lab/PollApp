import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      consent JSONB NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS polls (
      id SERIAL PRIMARY KEY,
      owner_id TEXT NULL REFERENCES users(id) ON DELETE CASCADE,
      guest_id TEXT NULL,
      guest_username TEXT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      is_public BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (
        (owner_id IS NOT NULL AND guest_id IS NULL)
        OR
        (owner_id IS NULL AND guest_id IS NOT NULL)
      )
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS votes (
      id SERIAL PRIMARY KEY,
      poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
      user_id TEXT NULL REFERENCES users(id) ON DELETE CASCADE,
      guest_id TEXT NULL,
      option_index INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (
        (user_id IS NOT NULL AND guest_id IS NULL)
        OR
        (user_id IS NULL AND guest_id IS NOT NULL)
      )
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS votes_unique_user_vote
    ON votes (poll_id, user_id)
    WHERE user_id IS NOT NULL;
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS votes_unique_guest_vote
    ON votes (poll_id, guest_id)
    WHERE guest_id IS NOT NULL;
  `);
}