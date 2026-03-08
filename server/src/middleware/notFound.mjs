// middleware/notFound.mjs

export default function notFound(req, res, next) {
  const message = req.t
    ? req.t("errors.notFound")
    : "The requested resource was not found.";

  res.status(404).json({
    error: message
  });
}