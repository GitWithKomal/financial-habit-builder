const Habit    = require('../models/Habit.model');
const HabitLog = require('../models/HabitLog.model');

// ─── Helper: get today as "YYYY-MM-DD" ───────────────────────
const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

// ─── Helper: calculate streak from sorted log dates ──────────
const calculateStreak = (sortedDates) => {
  if (!sortedDates.length) return 0;

  const today  = getTodayString();
  const dates  = [...sortedDates].sort().reverse(); // most recent first
  let   streak = 0;

  // streak is valid if most recent check-in is today or yesterday
  let expected = today;

  for (const date of dates) {
    if (date === expected) {
      streak++;
      // move expected to previous day
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().split('T')[0];
    } else if (date < expected) {
      break; // gap found — streak broken
    }
  }

  return streak;
};


// ════════════════════════════════════════════════════════════
// HABIT MANAGEMENT
// ════════════════════════════════════════════════════════════

// @desc   Create a new habit
// @route  POST /api/habits
// @access Private
const createHabit = async (req, res) => {
  try {
    const { name, description, frequency, category, targetDays, reminderTime } = req.body;

    const habit = await Habit.create({
      user: req.user.id,
      name,
      description,
      frequency,
      category,
      targetDays,
      reminderTime,
    });

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      data: habit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// @desc   Get all habits for logged-in user (active only by default)
// @route  GET /api/habits
// @access Private
const getAllHabits = async (req, res) => {
  try {
    // ?showInactive=true returns soft-deleted habits too
    const showInactive = req.query.showInactive === 'true';
    const filter = { user: req.user.id };
    if (!showInactive) filter.isActive = true;

    const habits = await Habit.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: habits.length,
      data: habits,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// @desc   Get a single habit by ID
// @route  GET /api/habits/:id
// @access Private
const getHabitById = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    res.status(200).json({ success: true, data: habit });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// @desc   Update a habit (including soft delete via isActive: false)
// @route  PUT /api/habits/:id
// @access Private
const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const allowedFields = ['name', 'description', 'frequency', 'category', 'targetDays', 'isActive', 'reminderTime'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) habit[field] = req.body[field];
    });

    await habit.save();

    res.status(200).json({
      success: true,
      message: 'Habit updated successfully',
      data: habit,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// @desc   Soft delete a habit (sets isActive: false)
// @route  DELETE /api/habits/:id
// @access Private
const deleteHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    habit.isActive = false;
    await habit.save();

    res.status(200).json({
      success: true,
      message: 'Habit deactivated (soft deleted)',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ════════════════════════════════════════════════════════════
// HABIT CHECK-IN
// ════════════════════════════════════════════════════════════

// @desc   Mark a habit as completed for today
// @route  POST /api/habits/:id/checkin
// @access Private
const checkIn = async (req, res) => {
  try {
    // 1. Verify habit belongs to user and is active
    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true,
    });

    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Active habit not found',
      });
    }

    const today = getTodayString();

    // 2. Check for duplicate check-in today
    const alreadyCheckedIn = await HabitLog.findOne({
      habit: habit._id,
      completedDate: today,
    });

    if (alreadyCheckedIn) {
      return res.status(409).json({
        success: false,
        message: 'You have already checked in for this habit today',
      });
    }

    // 3. Create the log entry
    const log = await HabitLog.create({
      habit: habit._id,
      user: req.user.id,
      completedDate: today,
      note: req.body.note || '',
    });

    res.status(201).json({
      success: true,
      message: `Habit checked in for ${today}`,
      data: log,
    });
  } catch (error) {
    // MongoDB unique index violation (race condition safety net)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Already checked in for today (duplicate blocked)',
      });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// ════════════════════════════════════════════════════════════
// STREAK CALCULATION
// ════════════════════════════════════════════════════════════

// @desc   Get current streak + full log for a habit
// @route  GET /api/habits/:id/streak
// @access Private
const getStreak = async (req, res) => {
  try {
    // 1. Verify ownership
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });

    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    // 2. Fetch all check-in dates for this habit
    const logs = await HabitLog.find({ habit: habit._id })
      .select('completedDate -_id')
      .sort({ completedDate: -1 });

    const dates = logs.map((log) => log.completedDate);

    // 3. Calculate streak
    const currentStreak = calculateStreak(dates);

    // 4. Progress toward target
    const totalCompletions = dates.length;
    const progressPercent  = habit.targetDays
      ? Math.min(Math.round((totalCompletions / habit.targetDays) * 100), 100)
      : null;

    res.status(200).json({
      success: true,
      data: {
        habitId:          habit._id,
        habitName:        habit.name,
        currentStreak,
        totalCompletions,
        targetDays:       habit.targetDays,
        progressPercent,
        completedDates:   dates,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


module.exports = {
  createHabit,
  getAllHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  checkIn,
  getStreak,
};