const { body } = require('express-validator');

// ─── Create Habit ────────────────────────────────────────────
const createHabitValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Habit name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters'),

  body('frequency')
    .optional()
    .isIn(['daily', 'weekly'])
    .withMessage('Frequency must be daily or weekly'),

  body('category')
    .optional()
    .isIn([
      'saving', 'budgeting', 'investing',
      'debt_repayment', 'expense_tracking', 'other',
    ])
    .withMessage('Invalid category value'),

  body('targetDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target days must be a positive integer'),

  body('reminderTime')
    .optional()
    .isString()
    .withMessage('Reminder time must be a string like "08:00 AM"'),
];

// ─── Update Habit ────────────────────────────────────────────
const updateHabitValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Habit name cannot be empty')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters'),

  body('frequency')
    .optional()
    .isIn(['daily', 'weekly'])
    .withMessage('Frequency must be daily or weekly'),

  body('category')
    .optional()
    .isIn([
      'saving', 'budgeting', 'investing',
      'debt_repayment', 'expense_tracking', 'other',
    ])
    .withMessage('Invalid category value'),

  body('targetDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target days must be a positive integer'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be true or false'),

  body('reminderTime')
    .optional()
    .isString()
    .withMessage('Reminder time must be a string'),
];

// ─── Habit Check-in ──────────────────────────────────────────
const checkInValidator = [
  body('note')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Note cannot exceed 200 characters'),
];

module.exports = {
  createHabitValidator,
  updateHabitValidator,
  checkInValidator,
};