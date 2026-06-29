const { body } = require('express-validator');

const VALID_CATEGORIES = [
  'emergency_fund', 'vacation',  'education',
  'home',           'vehicle',   'retirement',
  'investment',     'gadget',    'wedding', 'other',
];

const VALID_STATUSES = ['active', 'paused', 'completed'];


const createGoalValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Goal title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

  body('targetAmount')
    .notEmpty().withMessage('Target amount is required')
    .isFloat({ min: 1 }).withMessage('Target amount must be a number greater than 0'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters'),

  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code e.g. INR, USD')
    .isAlpha().withMessage('Currency must contain only letters'),

  body('category')
    .optional()
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),

  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Deadline must be a future date');
      }
      return true;
    }),

  body('icon')
    .optional()
    .isString().withMessage('Icon must be a string'),
];

const updateGoalValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty().withMessage('Title cannot be empty')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),

  body('targetAmount')
    .optional()
    .isFloat({ min: 1 }).withMessage('Target amount must be a number greater than 0'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Description cannot exceed 300 characters'),

  body('currency')
    .optional()
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code')
    .isAlpha().withMessage('Currency must contain only letters'),

  body('category')
    .optional()
    .isIn(VALID_CATEGORIES).withMessage('Invalid category'),

  body('deadline')
    .optional()
    .isISO8601().withMessage('Deadline must be a valid date'),

  body('status')
    .optional()
    .isIn(VALID_STATUSES).withMessage('Status must be active, paused, or completed'),

  body('icon')
    .optional()
    .isString().withMessage('Icon must be a string'),
];


const addContributionValidator = [
  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ min: 1 }).withMessage('Amount must be a positive number'),

  body('note')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Note cannot exceed 200 characters'),

  body('contributedAt')
    .optional()
    .isISO8601().withMessage('contributedAt must be a valid date'),
];

module.exports = {
  createGoalValidator,
  updateGoalValidator,
  addContributionValidator,
};