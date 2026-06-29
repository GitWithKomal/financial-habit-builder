const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be at least 1'],
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Saved amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'emergency_fund',
        'vacation',
        'education',
        'home',
        'vehicle',
        'retirement',
        'investment',
        'gadget',
        'wedding',
        'other',
      ],
      default: 'other',
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused'],
      default: 'active',
    },
    icon: {
      type: String,   
      default: '🎯',
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);


savingsGoalSchema.virtual('progressPercent').get(function () {
  if (!this.targetAmount) return 0;
  return Math.min(
    Math.round((this.savedAmount / this.targetAmount) * 100),
    100
  );
});


savingsGoalSchema.virtual('remainingAmount').get(function () {
  return Math.max(this.targetAmount - this.savedAmount, 0);
});


savingsGoalSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);