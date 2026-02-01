const fs = require("fs/promises");
const path = require("path");

function createJsonStore(filePath, defaultValue) {
  const absPath = path.resolve(filePath);

  async function read() {
    try {
      const raw = await fs.readFile(absPath, "utf-8");
      return JSON.parse(raw);
    } catch (e) {
      if (e.code === "ENOENT") return defaultValue;
      throw e;
    }
  }

  async function write(value) {
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, JSON.stringify(value, null, 2), "utf-8");
  }

  return { read, write };
}

module.exports = { createJsonStore };
