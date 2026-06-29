const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    category: {
      type: String,
      enum: [
        'saving',
        'budgeting',
        'investing',
        'debt_repayment',
        'expense_tracking',
        'other',
      ],
      default: 'other',
    },
    targetDays: {
      type: Number,
      default: 30, 
      min: [1, 'Target days must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true, 
    },
    reminderTime: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


habitSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('Habit', habitSchema);