// scripts/createVotesTable.mjs
// Creates the votes table in PostgreSQL.

import "dotenv/config";  // loads DATABASE_URL from .env
import { pool } from "../server/src/storage/db.mjs";

await pool.query(`
CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (poll_id, user_id)
);
`);

console.log("votes table created");

process.exit();