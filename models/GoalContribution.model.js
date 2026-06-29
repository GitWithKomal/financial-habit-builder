const mongoose = require('mongoose');

const goalContributionSchema = new mongoose.Schema(
  {
    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavingsGoal',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Contribution amount is required'],
      min: [1, 'Contribution must be at least 1'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [200, 'Note cannot exceed 200 characters'],
      default: '',
    },
    contributedAt: {
      type: Date,
      default: Date.now, 
    },
  },
  {
    timestamps: true,
  }
);

goalContributionSchema.index({ goal: 1, contributedAt: -1 });

goalContributionSchema.index({ user: 1 });

module.exports = mongoose.model('GoalContribution', goalContributionSchema);