const { validationResult } = require('express-validator');

/**
 * Middleware: reads express-validator errors from req.
 * If errors exist → return 400 with details.
 * If clean → call next().
 * Place this AFTER your validator array in any route.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = validate;