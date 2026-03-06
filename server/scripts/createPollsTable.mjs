// server/scripts/createPollsTable.mjs
import "dotenv/config";
import { pool } from "../src/storage/db.mjs";

await pool.query(`
CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

console.log("polls table created");

await pool.end();
process.exit(0);