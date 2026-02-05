// server/src/auth/sessions.js
// In-memory sessions (no file I/O). Stable for assignments.

const sessions = new Map(); // token -> { userId, createdAt }

function createSession(token, userId) {
  sessions.set(token, { userId, createdAt: Date.now() });
}

function getSession(token) {
  return sessions.get(token) || null;
}

function deleteSession(token) {
  sessions.delete(token);
}

module.exports = { createSession, getSession, deleteSession };
