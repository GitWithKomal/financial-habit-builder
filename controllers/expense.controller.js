const Expense = require("../models/Expense.model");

// POST /api/expenses
const createExpense = async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    const expense = await Expense.create({
      userId: req.user.id,
      amount,
      category,
      description,
      date,
    });

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// GET /api/expenses
const getAllExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;

    const filter = {
      userId: req.user.id,
    };

    if (category) filter.category = category;

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const total = await Expense.countDocuments(filter);

    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      expenses,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// GET /api/expenses/:id
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense)
      return res.status(404).json({
        message: "Expense not found",
      });

    if (expense.userId.toString() !== req.user.id)
      return res.status(403).json({
        message: "Access denied",
      });

    res.status(200).json({ expense });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense)
      return res.status(404).json({
        message: "Expense not found",
      });

    if (expense.userId.toString() !== req.user.id)
      return res.status(403).json({
        message: "Access denied",
      });

    const { amount, category, description, date } = req.body;

    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = date;

    await expense.save();

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense)
      return res.status(404).json({
        message: "Expense not found",
      });

    if (expense.userId.toString() !== req.user.id)
      return res.status(403).json({
        message: "Access denied",
      });

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};