/**
 * Authentication middleware.
 *
 * Ensures the request has a valid bearer token and session.
 */

import { getSessionUserId } from "../services/sessions.service.mjs";
import { getBearerToken } from "../utils/authUtils.mjs";

export function requireAuth() {
  return async (req, res, next) => {
    try {
      const token = getBearerToken(req);

      if (!token) {
        return res.status(401).json({
          error:
            req.t?.("errors.unauthorized") ||
            "Missing or invalid Authorization header",
        });
      }

      const userId = await getSessionUserId(token);

      if (!userId) {
        return res.status(401).json({
          error: req.t?.("errors.unauthorized") || "Invalid session",
        });
      }

      req.auth = { token, userId };
      next();
    } catch (error) {
      next(error);
    }
  };
}