const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");
const { validationResult } = require("express-validator");

// ─────────────────────────────────────────────
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    // 1. Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { name, email, password } = req.body;

    // 2. Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // 3. Create user (password hashing handled by pre-save hook in model)
    const user = await User.create({ name, email, password });

    // 4. Generate token
    const token = generateToken(user._id, user.role);

    // 5. Respond
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    // 1. Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { email, password } = req.body;

    // 2. Find user (explicitly select password since it's select:false in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      // Generic message — don't reveal whether email exists
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 3. Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact support.",
      });
    }

    // 4. Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // 5. Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // 6. Generate token
    const token = generateToken(user._id, user.role);

    // 7. Respond
    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/auth/me
// @access  Private (requires JWT)
// ─────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // req.user is already attached by protect middleware
    return res.status(200).json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route   PUT /api/auth/change-password
// @access  Private
// ─────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Fetch user with password (select:false in schema)
    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword; // pre-save hook re-hashes
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────
const logout = (req, res) => {
  // JWT is stateless — client deletes token from storage.
  // If you add a token blacklist in future, handle it here.
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

module.exports = { register, login, getMe, changePassword, logout };