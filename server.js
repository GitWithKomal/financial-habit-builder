// backend/server.js

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// ── Middleware ────────────────────────────────────────────
const errorMiddleware = require("./middleware/error.middleware");

// ── Routes ───────────────────────────────────────────────
const healthRoute   = require("./routes/health.routes");
const authRoutes    = require("./routes/auth.routes");
const incomeRoutes  = require("./routes/income.routes");
const expenseRoutes = require("./routes/expense.routes");
const habitRoutes = require('./routes/habit.routes');
const goalRoutes = require("./routes/goal.routes");
const dashboardRoutes = require("./routes/dashboard.routes");




// const habitRoutes     = require("./routes/habit.routes");
// const goalRoutes      = require("./routes/goal.routes");
// const dashboardRoutes = require("./routes/dashboard.routes");
// const adminRoutes     = require("./routes/admin.routes");

const app = express();
const PORT       = process.env.PORT       || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// ── CORS ──────────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? CLIENT_URL : "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// ── Body Parsers ──────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));


// ── Routes ───────────────────────────────────────────────
app.use("/api/health",   healthRoute);
app.use("/api/auth",     authRoutes);
app.use("/api/income",   incomeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use('/api/habits', habitRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/habits",    habitRoutes);
// app.use("/api/goals",     goalRoutes);
// app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/admin",     adminRoutes);

// ── 404 ───────────────────────────────────────────────────
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// ── Global Error Handler (must be last) ──────────────────
app.use(errorMiddleware);

// ── Startup ───────────────────────────────────────────────
const startServer = async () => {
  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing  = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`❌ Missing env vars: ${missing.join(", ")}`);
    process.exit(1);
  }

  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🏥 Health:      http://localhost:${PORT}/api/health`);
    console.log(`🔐 Auth:        http://localhost:${PORT}/api/auth`);
    console.log(`💰 Income:      http://localhost:${PORT}/api/income`);
    console.log(`💸 Expenses:    http://localhost:${PORT}/api/expenses`);
  });

  const shutdown = (signal) => {
    console.log(`\n⚠️  ${signal} received. Shutting down...`);
    server.close(() => process.exit(0));
  };

  process.on("SIGINT",  () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Rejection:", reason);
    server.close(() => process.exit(1));
  });
};

startServer();