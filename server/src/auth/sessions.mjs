const sessions = new Map();

/**
 * token -> userId
 */
export function createSession(token, userId) {
  sessions.set(token, userId);
}

export function deleteSession(token) {
  sessions.delete(token);
}

export function getSessionUserId(token) {
  return sessions.get(token) || null;
}