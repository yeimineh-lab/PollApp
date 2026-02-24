export default function requireJson(req, res, next) {
  if (req.method === "GET") return next();

  const ct = req.headers["content-type"] || "";
  if (!ct.includes("application/json")) {
    return res.status(415).json({ error: "Content-Type must be application/json" });
  }
  next();
}