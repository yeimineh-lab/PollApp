-- PollApp database schema
-- Source of truth: src/storage/db.mjs

-- users: registered accounts
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consent JSONB NOT NULL
);

-- sessions: active login sessions (auth tokens)
CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- polls: polls created by users or guests
CREATE TABLE polls (
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

-- votes: votes on polls (user or guest)
CREATE TABLE votes (
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

-- prevent duplicate votes
CREATE UNIQUE INDEX votes_unique_user_vote
ON votes (poll_id, user_id)
WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX votes_unique_guest_vote
ON votes (poll_id, guest_id)
WHERE guest_id IS NOT NULL;