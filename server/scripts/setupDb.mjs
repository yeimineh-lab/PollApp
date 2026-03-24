import "dotenv/config";
import { initDb, pool } from "../src/storage/db.mjs";

async function setup() {
  try {
    console.log("Setting up database...");
    console.log("DATABASE_URL loaded:", Boolean(process.env.DATABASE_URL));

    await initDb();

    console.log("Database setup complete");
  } catch (err) {
    console.error("Error setting up DB:", err);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setup();