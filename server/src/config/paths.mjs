import path from "node:path";
import { fileURLToPath } from "node:url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const SERVER = path.join(__dirname, "..", "..");

export const PUBLIC_DIR = path.join(SERVER, "public");
export { SERVER };