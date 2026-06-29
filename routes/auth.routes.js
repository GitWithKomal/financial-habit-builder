const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  register,
  login,
  getMe,
  changePassword,
  logout,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth.middleware");

const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Enter a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty().withMessage("Current password is required"),

  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
    .matches(/\d/).withMessage("New password must contain at least one number"),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);


router.get("/me", protect, getMe);
router.put("/change-password", protect, changePasswordValidation, changePassword);
router.post("/logout", protect, logout);

module.exports = router;