import path from "node:path";
import { fileURLToPath } from "node:url";

// ESM har ikke __dirname, så vi lager den selv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// __dirname = server/src/config
const SERVER = path.join(__dirname, "..", "..");

export const PUBLIC_DIR = path.join(SERVER, "public");
export const DATA_DIR = path.join(SERVER, "data");
export { SERVER };