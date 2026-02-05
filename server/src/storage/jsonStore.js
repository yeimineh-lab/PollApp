const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function readJsonSafe(filePath, defaultValue) {
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    if (!raw.trim()) return defaultValue; // tom fil -> default
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return defaultValue; // finnes ikke -> default
    // Hvis JSON er korrupt/halvskrevet, kast med tydelig melding
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${filePath}. File may be partially written.`);
    }
    throw err;
  }
}

async function atomicWriteJson(filePath, value) {
  ensureDirForFile(filePath);
  const tmpPath = `${filePath}.${process.pid}.tmp`;

  const data = JSON.stringify(value, null, 2);
  await fsp.writeFile(tmpPath, data, "utf8");
  await fsp.rename(tmpPath, filePath); // atomic on same volume
}

function createJsonStore(filePath, defaultValue) {
  const resolved = path.resolve(filePath);

  return {
    path: resolved,

    async read() {
      return readJsonSafe(resolved, defaultValue);
    },

    async write(value) {
      await atomicWriteJson(resolved, value);
    },
  };
}

module.exports = { createJsonStore };
