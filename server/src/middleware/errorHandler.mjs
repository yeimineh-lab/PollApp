export default function errorHandler(err, req, res, _next) {
  const status = err.status || 500;

  if (res.headersSent) {
    return;
  }

  if (status >= 500) {
    console.error(err);
  }

  const fallbackMessage =
    status === 500
      ? req.t?.("errors.internal") || "Internal server error"
      : err.message || "Error";

  res.status(status).json({
    error: fallbackMessage,
  });
}