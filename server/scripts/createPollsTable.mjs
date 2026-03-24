import "dotenv/config";
import { initDb, pool } from "../src/storage/db.mjs";

try {
  await initDb();
  console.log("polls table ensured");
} catch (error) {
  console.error("Failed to ensure polls table:", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}