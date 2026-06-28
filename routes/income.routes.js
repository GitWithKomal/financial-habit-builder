const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const { protect } = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createIncome,
  getAllIncome,
  getIncomeById,
  updateIncome,
  deleteIncome,
} = require("../controllers/income.controller");

const incomeValidation = [
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number"),

  body("source")
    .notEmpty()
    .withMessage("Source is required"),

  body("type")
    .isIn(["recurring", "one-time"])
    .withMessage("Type must be recurring or one-time"),

  body("date")
    .isISO8601()
    .withMessage("Valid date is required"),
];

router.use(protect);

router.post("/", incomeValidation, validate, createIncome);
router.get("/", getAllIncome);
router.get("/:id", getIncomeById);
router.put("/:id", incomeValidation, validate, updateIncome);
router.delete("/:id", deleteIncome);

module.exports = router;