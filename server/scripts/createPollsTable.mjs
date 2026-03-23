import "dotenv/config";
import { pool } from "../src/storage/db.mjs";

await pool.query(`
CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  owner_id TEXT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_id TEXT NULL,
  guest_username TEXT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (
    (owner_id IS NOT NULL AND guest_id IS NULL)
    OR
    (owner_id IS NULL AND guest_id IS NOT NULL)
  )
);
`);

console.log("polls table created");

await pool.end();
process.exit(0);