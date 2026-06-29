const { ROLES } = require("../utils/constants");

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