/**
 * Global Error Handler Middleware
 *
 * Must be registered LAST in app.js (after all routes).
 * Express identifies it as an error handler because it has 4 parameters: (err, req, res, next).
 *
 * Handles:
 * - Mongoose CastError (invalid ObjectId)
 * - Mongoose duplicate key error (code 11000)
 * - Mongoose validation errors
 * - JWT errors (handled in auth middleware, but caught here as fallback)
 * - Generic server errors
 */

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // ── Mongoose: Invalid ObjectId ──────────────────────────
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ── Mongoose: Duplicate key (e.g. duplicate email) ──────
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // ── Mongoose: Validation errors ─────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // ── JWT: Invalid token ───────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  // ── JWT: Token expired ───────────────────────────────────
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please log in again.";
  }

  // ── Log in development only ──────────────────────────────
  if (process.env.NODE_ENV === "development") {
    console.error(`[ERROR] ${err.stack}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Stack trace only in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;