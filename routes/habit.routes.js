const express  = require('express');
const router   = express.Router();

const { protect } = require('../middleware/auth.middleware');
const validate    = require('../middleware/validate.middleware');
const {
  createHabitValidator,
  updateHabitValidator,
  checkInValidator,
} = require('../validators/habit.validator');
const {
  createHabit,
  getAllHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  checkIn,
  getStreak,
} = require('../controllers/habit.controller');

router.use(protect);

router.post  ('/',     createHabitValidator, validate, createHabit);
router.get   ('/',     getAllHabits);
router.get   ('/:id', getHabitById);
router.put   ('/:id', updateHabitValidator, validate, updateHabit);
router.delete('/:id', deleteHabit);


router.post('/:id/checkin', checkInValidator, validate, checkIn);


router.get('/:id/streak', getStreak);

module.exports = router;