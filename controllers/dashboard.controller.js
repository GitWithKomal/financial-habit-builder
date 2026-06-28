const mongoose = require("mongoose");
const Income = require("../models/Income.model");
const Expense = require("../models/Expense.model");
const Habit = require("../models/Habit.model");
const SavingsGoal = require("../models/SavingsGoal.model");

// ─────────────────────────────────────────────
// 1. SUMMARY
// ─────────────────────────────────────────────
const getSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    console.log("req.user =", req.user);
    console.log("req.user.id =", req.user.id);

    const incomeAgg = await Income.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const expenseAgg = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpense = expenseAgg[0]?.total || 0;

    const activeHabits = await Habit.countDocuments({
      user: userId,
      isActive: true,
    });

    const activeGoals = await SavingsGoal.countDocuments({
      user: userId,
      status: "active",
    });

    const completedGoals = await SavingsGoal.countDocuments({
      user: userId,
      status: "completed",
    });

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        activeHabits,
        activeGoals,
        completedGoals,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ─────────────────────────────────────────────
// 2. CHARTS
// ─────────────────────────────────────────────
const getCharts = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const incomeByMonth = await Income.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $month: "$date" },
          income: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const expenseByMonth = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { $month: "$date" },
          expense: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        incomeByMonth,
        expenseByMonth,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ─────────────────────────────────────────────
// 3. HABITS ANALYTICS
// ─────────────────────────────────────────────
const getHabitStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const habits = await Habit.find({ user: userId });

    const totalHabits = habits.length;

    const bestStreak = habits.reduce(
      (max, h) => Math.max(max, h.streak || 0),
      0,
    );

    const avgStreak =
      totalHabits > 0
        ? habits.reduce((sum, h) => sum + (h.streak || 0), 0) / totalHabits
        : 0;

    const completionRate =
      totalHabits > 0
        ? (habits.filter((h) => h.isActive).length / totalHabits) * 100
        : 0;

    res.json({
      success: true,
      data: {
        totalHabits,
        averageStreak: Number(avgStreak.toFixed(2)),
        bestStreak,
        completionRate: Number(completionRate.toFixed(2)),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ─────────────────────────────────────────────
// 4. GOALS ANALYTICS
// ─────────────────────────────────────────────
const getGoalStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const goals = await SavingsGoal.find({ user: userId });

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === "completed").length;

    const averageProgress =
      totalGoals > 0
        ? goals.reduce((sum, g) => sum + g.progressPercent, 0) / totalGoals
        : 0;

    res.json({
      success: true,
      data: {
        totalGoals,
        completedGoals,
        averageProgress: Number(averageProgress.toFixed(2)),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getSummary,
  getCharts,
  getHabitStats,
  getGoalStats,
};
