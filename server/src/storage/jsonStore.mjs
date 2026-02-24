import fs from "node:fs/promises";
import path from "node:path";

export function createJsonStore(filePath, defaultValue) {
  async function ensureFile() {
    try {
      await fs.access(filePath);
    } catch {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
    }
  }

  return {
    async read() {
      await ensureFile();
      const raw = await fs.readFile(filePath, "utf8");
      return JSON.parse(raw);
    },

    async write(value) {
      await ensureFile();
      await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
    },
  };
}