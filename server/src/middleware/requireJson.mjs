/**
 * JSON validation middleware.
 *
 * Ensures requests use application/json when required.
 */

export default function requireJson(req, res, next) {
  const methodsRequiringJson = ["POST", "PUT", "PATCH"];

  if (!methodsRequiringJson.includes(req.method)) {
    return next();
  }

  const ct = req.headers["content-type"] || "";

  if (!ct.includes("application/json")) {
    return res.status(415).json({
      error: "Content-Type must be application/json",
    });
  }

  next();
}