/**
 * JSON content-type middleware.
 *
 * Ensures requests that send a body use application/json.
 */

export default function requireJson(req, res, next) {
  const methodsRequiringJson = ["POST", "PUT", "PATCH"];

  if (!methodsRequiringJson.includes(req.method)) {
    return next();
  }

  const contentType = req.headers["content-type"] || "";

  if (!contentType.includes("application/json")) {
    return res.status(415).json({
      error:
        req.t?.("errors.invalidInput") ||
        "Content-Type must be application/json",
    });
  }

  next();
}