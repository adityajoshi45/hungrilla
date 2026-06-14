const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

module.exports = adminMiddleware;
