/**
 * Error handler middleware.
 *
 * Formats errors and sends HTTP responses.
 */

export default function errorHandler(err, req, res, _next) {
  const status = err.status || 500;

  if (res.headersSent) {
    return;
  }

  if (status >= 500) {
    console.error(err);
  }

  let fallbackMessage;

  switch (status) {
    case 400:
      fallbackMessage =
        req.t?.("errors.invalidInput") || err.message || "Invalid input.";
      break;
    case 401:
      fallbackMessage =
        req.t?.("errors.unauthorized") || err.message || "Unauthorized.";
      break;
    case 403:
      fallbackMessage =
        req.t?.("errors.forbidden") || err.message || "Forbidden.";
      break;
    case 404:
      fallbackMessage =
        req.t?.("errors.notFound") || err.message || "Not found.";
      break;
    case 409:
      fallbackMessage =
        req.t?.("errors.conflict") || err.message || "Conflict.";
      break;
    default:
      fallbackMessage =
        req.t?.("errors.serverError") || "Internal server error";
  }

  res.status(status).json({
    error: fallbackMessage,
  });
}