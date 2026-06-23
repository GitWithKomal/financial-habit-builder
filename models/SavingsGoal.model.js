const mongoose = require("mongoose");

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Goal name is required"],
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: [true, "Target amount is required"],
      min: [1, "Target must be at least 1"],
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: [0, "Saved amount cannot be negative"],
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    status: {
      type: String,
      enum: ["active", "completed", "paused"],
      default: "active",
    },
  },
  { timestamps: true } // both createdAt and updatedAt needed here
);

module.exports = mongoose.model("SavingsGoal", savingsGoalSchema);