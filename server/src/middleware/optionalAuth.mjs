import { getSessionUserId } from "../services/sessions.service.mjs";

export function optionalAuth() {
  return async (req, _res, next) => {
    try {
      const header = req.headers.authorization || "";
      const [type, token] = header.split(" ");

      if (type === "Bearer" && token) {
        const userId = await getSessionUserId(token);

        if (userId) {
          req.auth = { token, userId };
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}