const mongoose = require("mongoose");

const habitLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    habitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },
    date: {
      type: String, // stored as "YYYY-MM-DD" for easy dedup
      required: [true, "Date is required"],
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

// Prevent duplicate log for same habit on same date
habitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("HabitLog", habitLogSchema);