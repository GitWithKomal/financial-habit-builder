const SavingsGoal       = require('../models/SavingsGoal.model');
const GoalContribution  = require('../models/GoalContribution.model');


// ════════════════════════════════════════════════════════════
// SAVINGS GOAL MANAGEMENT
// ════════════════════════════════════════════════════════════

// @desc   Create a new savings goal
// @route  POST /api/goals
// @access Private
const createGoal = async (req, res) => {
  try {
    const {
      title, description, targetAmount,
      currency, category, deadline, icon,
    } = req.body;

    const goal = await SavingsGoal.create({
      user: req.user.id,
      title,
      description,
      targetAmount,
      currency,
      category,
      deadline: deadline ? new Date(deadline) : null,
      icon,
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      data: goal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// @desc   Get all savings goals for the logged-in user
// @route  GET /api/goals
// @access Private
const getAllGoals = async (req, res) => {
  try {
    // Optional filter: ?status=active | paused | completed
    const filter = { user: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const goals = await SavingsGoal.find(filter).sort({ createdAt: -1 });

    // virtuals (progressPercent, remainingAmount) are included automatically
    res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// @desc   Get a single savings goal with contributions
// @route  GET /api/goals/:id
// @access Private
const getGoalById = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    // Fetch contribution history for this goal
    const contributions = await GoalContribution.find({ goal: goal._id })
      .sort({ contributedAt: -1 })
      .select('amount note contributedAt createdAt');

    res.status(200).json({
      success: true,
      data: {
        ...goal.toJSON(), // includes virtuals
        contributions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// @desc   Update a savings goal
// @route  PUT /api/goals/:id
// @access Private
const updateGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    const allowedFields = [
      'title', 'description', 'targetAmount',
      'currency', 'category', 'deadline',
      'status', 'icon',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) goal[field] = req.body[field];
    });

    // Re-check completion in case targetAmount was lowered
    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Savings goal updated successfully',
      data: goal,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// @desc   Delete a savings goal and its contributions
// @route  DELETE /api/goals/:id
// @access Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    // Delete all contributions linked to this goal
    await GoalContribution.deleteMany({ goal: goal._id });

    // Hard delete the goal itself
    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Savings goal and all contributions deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ════════════════════════════════════════════════════════════
// GOAL CONTRIBUTION
// ════════════════════════════════════════════════════════════

// @desc   Add a contribution to a savings goal
// @route  POST /api/goals/:id/contribute
// @access Private
const addContribution = async (req, res) => {
  try {
    // 1. Verify goal belongs to user
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    // 2. Block contributions to completed goals
    if (goal.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This goal is already completed. No further contributions needed.',
      });
    }

    const { amount, note, contributedAt } = req.body;

    // 3. Save contribution record
    const contribution = await GoalContribution.create({
      goal:   goal._id,
      user:   req.user.id,
      amount: parseFloat(amount),
      note:   note || '',
      contributedAt: contributedAt ? new Date(contributedAt) : new Date(),
    });

    // 4. Update savedAmount on the goal
    goal.savedAmount = parseFloat(
      (goal.savedAmount + contribution.amount).toFixed(2)
    );

    // 5. Auto-complete if target reached
    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.status(201).json({
      success: true,
      message: goal.status === 'completed'
        ? '🎉 Goal completed! Target amount reached.'
        : 'Contribution added successfully',
      data: {
        contribution,
        goal: {
          id:               goal._id,
          title:            goal.title,
          targetAmount:     goal.targetAmount,
          savedAmount:      goal.savedAmount,
          remainingAmount:  goal.remainingAmount,   // virtual
          progressPercent:  goal.progressPercent,   // virtual
          status:           goal.status,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// @desc   Get all contributions for a specific goal
// @route  GET /api/goals/:id/contributions
// @access Private
const getContributions = async (req, res) => {
  try {
    // Verify goal ownership first
    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    const contributions = await GoalContribution.find({ goal: goal._id })
      .sort({ contributedAt: -1 });

    const totalContributed = contributions.reduce(
      (sum, c) => sum + c.amount, 0
    );

    res.status(200).json({
      success: true,
      count: contributions.length,
      totalContributed: parseFloat(totalContributed.toFixed(2)),
      data: contributions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


module.exports = {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  addContribution,
  getContributions,
};