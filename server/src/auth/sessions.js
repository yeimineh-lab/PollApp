const sessions = new Map(); // token -> userId

function createSession(token, userId) {
  sessions.set(token, userId);
}

function getUserIdByToken(token) {
  return sessions.get(token) || null;
}

function deleteSession(token) {
  sessions.delete(token);
}

module.exports = { createSession, getUserIdByToken, deleteSession };
