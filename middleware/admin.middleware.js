const { ROLES } = require("../utils/constants");

/**
 * Restricts access to admin-only routes.
 * Must be used AFTER the protect middleware.
 * Usage: router.get("/admin/route", protect, adminOnly, controller)
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }

  next();
};

/**
 * Allows access if the user is the resource owner OR an admin.
 * Usage: router.get("/users/:id", protect, ownerOrAdmin, controller)
 */
const ownerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const isOwner = req.user._id.toString() === req.params.id;
  const isAdmin = req.user.role === ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Not authorized.",
    });
  }

  next();
};

module.exports = { adminOnly, ownerOrAdmin };