const { getUserIdByToken } = require("./sessions");

function requireAuth() {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing auth token" });
    }

    const userId = getUserIdByToken(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid auth token" });
    }

    req.auth = { userId, token };
    next();
  };
}

module.exports = { requireAuth };
