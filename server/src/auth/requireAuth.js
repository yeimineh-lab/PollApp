// server/src/auth/requireAuth.js
const { getSession } = require("./sessions");

function requireAuth() {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const match = header.match(/^Bearer\s+(.+)$/i);

    if (!match) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const token = match[1].trim();
    const session = getSession(token);

    if (!session) {
      return res.status(401).json({ error: "Invalid auth token" });
    }

    req.auth = { userId: session.userId, token };
    next();
  };
}

module.exports = { requireAuth };
