export default function notFound(req, res) {
  res.status(404).json({
    error: req.t?.("errors.notFound") || "Not found",
  });
}