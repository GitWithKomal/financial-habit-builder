const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require("../controllers/expense.controller");

const expenseValidation = [
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),

  body("category")
    .isIn([
      "food",
      "rent",
      "transport",
      "health",
      "entertainment",
      "utilities",
      "education",
      "other",
    ])
    .withMessage("Invalid category"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("date")
    .isISO8601()
    .withMessage("Valid date is required"),
];


const expenseUpdateValidation = [
  body("amount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),

  body("category")
    .optional()
    .isIn([
      "food",
      "rent",
      "transport",
      "health",
      "entertainment",
      "utilities",
      "education",
      "other",
    ])
    .withMessage("Invalid category"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),

  body("date")
    .optional()
    .isISO8601()
    .withMessage("Valid date is required"),
];

router.use(protect);

router.post("/", expenseValidation, validate, createExpense);
router.get("/", getAllExpenses);
router.get("/:id", getExpenseById);
router.put("/:id", expenseUpdateValidation, validate, updateExpense);
router.delete("/:id", deleteExpense);

module.exports = router;