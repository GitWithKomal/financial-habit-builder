const Income = require("../models/Income.model");

const createIncome = async (req, res) => {
  try {
    const { amount, source, description, type, date } = req.body;

    const income = await Income.create({
      userId: req.user.id,
      amount,
      source,
      description,
      type,
      date,
    });

    res.status(201).json({
      success: true,
      message: "Income created successfully",
      data: income,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};


const getAllIncome = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, source } = req.query;

    const filter = {
      userId: req.user.id,
    };

    if (source) filter.source = source;

    if (startDate || endDate) {
      filter.date = {};

      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const total = await Income.countDocuments(filter);

    const incomes = await Income.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      incomes,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};


const getIncomeById = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        message: "Income not found",
      });
    }

    if (income.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.status(200).json({
      income,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};


const updateIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        message: "Income not found",
      });
    }

    if (income.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const { amount, source, description, type, date } = req.body;

    if (amount !== undefined) income.amount = amount;
    if (source !== undefined) income.source = source;
    if (description !== undefined) income.description = description;
    if (type !== undefined) income.type = type;
    if (date !== undefined) income.date = date;

    await income.save();

    res.status(200).json({
      success: true,
      message: "Income updated successfully",
      data: income,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};


const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({
        message: "Income not found",
      });
    }

    if (income.userId.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await income.deleteOne();

    res.status(200).json({
      success: true,
      message: "Income deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  createIncome,
  getAllIncome,
  getIncomeById,
  updateIncome,
  deleteIncome,
};