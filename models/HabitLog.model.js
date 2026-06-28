const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema(
  {
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedDate: {
      type: String, // stored as "YYYY-MM-DD" for easy daily comparison
      required: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate check-ins: same habit + same date = blocked
habitLogSchema.index({ habit: 1, completedDate: 1 }, { unique: true });

// Fast lookup: all logs for a user
habitLogSchema.index({ user: 1, completedDate: 1 });

module.exports = mongoose.model('HabitLog', habitLogSchema);