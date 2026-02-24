import { getSessionUserId } from "./sessions.mjs";

export function requireAuth() {
  return (req, res, next) => {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const userId = getSessionUserId(token);
    if (!userId) {
      return res.status(401).json({ error: "Invalid session" });
    }

    req.auth = { token, userId };
    next();
  };
}