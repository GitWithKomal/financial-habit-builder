const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

/**
 * GET /api/health
 *
 * Health check endpoint — used by:
 * - Render/AWS to verify the server is alive
 * - You, to confirm MongoDB is connected before testing features
 *
 * Returns: server status, MongoDB state, environment, timestamp
 */
router.get("/", (req, res) => {
  const mongoStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    success: true,
    message: "Server is running",
    data: {
      environment: process.env.NODE_ENV || "development",
      mongodb: mongoStates[mongoose.connection.readyState] || "unknown",
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
    },
  });
});

module.exports = router;