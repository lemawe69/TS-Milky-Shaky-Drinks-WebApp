function requireAdmin(req, res, next) {
  if (req.user?.role !== "MANAGER")
    return res.status(403).json({ message: "Forbidden" });
  next();
}

module.exports = { requireAdmin };
