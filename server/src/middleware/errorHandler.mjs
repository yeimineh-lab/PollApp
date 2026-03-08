export default function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status ?? 500;

  let message;

  if (status >= 500) {
    message = req.t ? req.t("errors.serverError") : "Internal server error";
  } else {
    message =
      err.message ||
      (req.t ? req.t("errors.invalidInput") : "Unexpected error");
  }

  res.status(status).json({ error: message });
}