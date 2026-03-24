import { getSessionUserId } from "../services/sessions.service.mjs";
import { getBearerToken } from "../utils/authUtils.mjs";

export function optionalAuth() {
  return async (req, _res, next) => {
    try {
      const token = getBearerToken(req);

      if (token) {
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